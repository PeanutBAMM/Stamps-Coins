import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { itemId } = await req.json()
        if (!itemId) throw new Error('itemId is required')

        // 1. Fetch item and user region
        const { data: item, error: itemError } = await supabaseClient
            .from('items')
            .select('*, profiles(region)')
            .eq('id', itemId)
            .single()

        if (itemError || !item) throw new Error('Item not found')
        const region = item.profiles?.region || 'EU'

        // 2. Search Grounding via Gemini for market price
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        const prompt = `Find the current market price for this ${item.category}: "${item.name}". 
    Region: ${region}. Metadata: ${JSON.stringify(item.metadata)}.
    Return strictly JSON: 
    - price (number)
    - currency (string, e.g. "EUR")
    - confidence (0-1)
    - source (string: name of major marketplace or auction house)`

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                tools: [{ google_search_retrieval: {} }], // Enable grounding
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        if (!geminiResp.ok) throw new Error('Gemini API request failed')
        const geminiData = await geminiResp.json()
        const marketResult = JSON.parse(geminiData.candidates[0].content.parts[0].text)

        // 3. Update market_prices table (cache)
        // We need the global_asset_id first
        const { data: globalAsset } = await supabaseClient
            .from('global_assets')
            .select('id')
            .eq('asset_identifier', item.metadata?.asset_identifier)
            .single()

        if (globalAsset) {
            await supabaseClient
                .from('market_prices')
                .upsert({
                    asset_id: globalAsset.id,
                    region: region,
                    current_value: marketResult.price,
                    confidence_score: marketResult.confidence,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'asset_id,region' })
        }

        // 4. Update item market_price
        await supabaseClient
            .from('items')
            .update({ market_price: marketResult.price, last_modified_at: new Date().toISOString() })
            .eq('id', itemId)

        return new Response(
            JSON.stringify(marketResult),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
