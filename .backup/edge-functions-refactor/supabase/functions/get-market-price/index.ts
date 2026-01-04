import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0"

Sentry.init({
    dsn: "https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096",
    tracesSampleRate: 1.0,
});

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
        const assetIdentifier = item.metadata?.asset_identifier;

        // 2. Liquid Update Model - Layer 1: Cache Check (Blueprint Section 9)
        // Check if we have a recent price (< 4 hours old) for this asset and region
        if (assetIdentifier) {
            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
            const { data: cachedPrice } = await supabaseClient
                .from('market_prices')
                .select('current_value, updated_at')
                .eq('region', region)
                .is('asset_id', null) // We'll use asset_identifier for simpler logic or join if needed
            // But wait, the schema uses asset_id. Let's find global_asset first.

            const { data: globalAsset } = await supabaseClient
                .from('global_assets')
                .select('id')
                .eq('asset_identifier', assetIdentifier)
                .single();

            if (globalAsset) {
                const { data: recentPrice } = await supabaseClient
                    .from('market_prices')
                    .select('current_value, updated_at')
                    .eq('asset_id', globalAsset.id)
                    .eq('region', region)
                    .gt('updated_at', fourHoursAgo)
                    .single();

                if (recentPrice) {
                    console.log(`Liquid Update Cache Hit: Found price ${recentPrice.current_value} updated at ${recentPrice.updated_at}`);
                    return new Response(
                        JSON.stringify({
                            price: recentPrice.current_value,
                            currency: item.metadata?.currency || 'EUR',
                            confidence: 1.0,
                            source: 'Cache (Liquid Update Model)'
                        }),
                        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
                }
            }
        }

        // 3. Search Grounding via Gemini 3 Flash (If cache miss)
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        const prompt = `Find the current market price for this ${item.category}: "${item.name}". 
    Region: ${region}. Metadata: ${JSON.stringify(item.metadata)}.
    Return strictly JSON: 
    - price (number)
    - currency (string, e.g. "EUR")
    - confidence (0-1)
    - source (string: name of major marketplace or auction house)`

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                tools: [{ google_search_retrieval: {} }], // Enable grounding
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        if (!geminiResp.ok) {
            const errText = await geminiResp.text();
            throw new Error(`Gemini API request failed: ${geminiResp.status} - ${errText}`)
        }
        const geminiData = await geminiResp.json()
        const marketResult = JSON.parse(geminiData.candidates[0].content.parts[0].text)

        // 4. Update market_prices table (cache)
        const { data: globalAsset } = await supabaseClient
            .from('global_assets')
            .select('id')
            .eq('asset_identifier', assetIdentifier)
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

        // 5. Update item market_price
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
        Sentry.captureException(error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
