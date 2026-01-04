import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, getSupabaseClients, handleError, handleSuccess, initSentry } from "../_shared/utils.ts"

// Initialize Sentry
initSentry();

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { supabaseClient, supabaseAdmin } = getSupabaseClients(req)

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
        if (authError || !user) throw new Error('User not authenticated')

        // 1. Check Pro status & Item Limit
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('pro_status, item_count')
            .eq('id', user.id)
            .single()

        if (profile && !profile.pro_status && (profile.item_count || 0) >= 35) {
            return new Response(
                JSON.stringify({ success: false, error: 'LIMIT_REACHED', message: 'Je hebt je gratis limiet van 35 items bereikt. Upgrade naar Pro voor onbeperkt scannen!' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
            )
        }

        const { imageUrl } = await req.json()
        if (!imageUrl) throw new Error('imageUrl is required')

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

        // 2. Identify item via Gemini 1.5 Flash
        const prompt = `Identify this postage stamp or coin. 
    Return strictly JSON with: 
    - name (string: clear title)
    - category ("stamp" | "coin")
    - year (number)
    - country (string)
    - description (string: brief summary)
    - asset_identifier (string: e.g. "COIN_NL_10G_1897")
    - condition_estimate (string)
    - confidence (0-1)
    - metadata (object for technical specs)`

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: await (await fetch(imageUrl)).arrayBuffer().then(buf => btoa(String.fromCharCode(...new Uint8Array(buf)))) } }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        if (!geminiResp.ok) throw new Error('Gemini API request failed')
        const geminiData = await geminiResp.json()
        const idResult = JSON.parse(geminiData.candidates[0].content.parts[0].text)

        // 3. Manage Global Assets (Deduplication)
        const { data: asset, error: assetError } = await supabaseAdmin
            .from('global_assets')
            .upsert({
                asset_identifier: idResult.asset_identifier,
                name: idResult.name,
                category: idResult.category,
                metadata: idResult.metadata
            }, { onConflict: 'asset_identifier' })
            .select()
            .single()

        if (assetError) throw assetError

        // 4. Find default vault
        const { data: vault } = await supabaseClient
            .from('vaults')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        // 5. Create User Item
        const { data: newItem, error: itemError } = await supabaseAdmin
            .from('items')
            .insert({
                user_id: user.id,
                vault_id: vault?.id,
                name: idResult.name,
                category: idResult.category,
                image_url: imageUrl,
                metadata: { ...idResult.metadata, year: idResult.year, country: idResult.country, asset_identifier: idResult.asset_identifier },
                condition_report: { estimate: idResult.condition_estimate, confidence: idResult.confidence },
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (itemError) throw itemError

        // 6. Increment Profile Item Count
        await supabaseAdmin
            .from('profiles')
            .update({ item_count: (profile?.item_count || 0) + 1 })
            .eq('id', user.id)

        return handleSuccess({ itemId: newItem.id, identification: idResult })

    } catch (error: any) {
        return await handleError(error, req)
    }
})
