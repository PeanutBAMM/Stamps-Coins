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
        // Client for validating user JWT (uses anon key with user's Authorization header)
        const authClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Client for database operations (uses service role key for full access)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Try to get authenticated user (optional for ghost mode)
        const { data: { user } } = await authClient.auth.getUser()
        const isGhostMode = !user;

        if (user) {
            Sentry.setUser({ id: user.id, email: user.email });
        } else {
            console.log('Ghost Mode: Processing scan without user authentication');
        }

        // 1. Check Pro status & Item Limit (only for authenticated users)
        let profile = null;
        if (user) {
            const { data } = await supabaseClient
                .from('profiles')
                .select('pro_status, item_count')
                .eq('id', user.id)
                .single()
            profile = data;

            if (profile && !profile.pro_status && profile.item_count >= 35) {
                return new Response(
                    JSON.stringify({ success: false, error: 'LIMIT_REACHED', message: 'Je hebt je gratis limiet van 35 items bereikt. Upgrade naar Pro voor onbeperkt scannen!' }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
                )
            }
        }

        const { imageUrl } = await req.json()
        if (!imageUrl) throw new Error('imageUrl is required')

        // 2. Privacy-First: EXIF/GPS Strip Check (Blueprint Section 11)
        console.log('Privacy Check: Verifying image metadata...');
        const imageResp = await fetch(imageUrl);
        const imageBuffer = await imageResp.arrayBuffer();
        const first64k = new Uint8Array(imageBuffer.slice(0, 65536));
        const hex = Array.from(first64k).map(b => b.toString(16).padStart(2, '0')).join('');

        // Search for common GPS tags in hex (e.g., "GPS " in ASCII is 47 50 53 20)
        if (hex.includes('47505320') || hex.includes('47505300')) {
            console.error('Privacy Violation: GPS data detected in uploaded image!');
            return new Response(
                JSON.stringify({ success: false, error: 'PRIVACY_VIOLATION', message: 'Geuploadde afbeelding bevat GPS-locatiegegevens. Verwijder deze voor je privacy.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

        // 3. Identify item via Gemini 3 Flash (Blueprint Section 3 Alignment)
        const prompt = `Identify this postage stamp or coin.
Return strictly JSON following this structure:
{
  "category": "Coin" | "Stamp",
  "identity": { 
    "country": string, 
    "year": number, 
    "denomination": string,
    "name": string
  },
  "condition": { 
    "grade": string, 
    "score": number, 
    "notes": string 
  },
  "market": { 
    "estimated_value": number, 
    "currency": string, 
    "confidence": number,
    "asset_identifier": string
  }
}`;

        // Convert image buffer to base64 in chunks to avoid stack overflow
        const uint8Array = new Uint8Array(imageBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.subarray(i, i + chunkSize);
            binaryString += String.fromCharCode.apply(null, [...chunk]);
        }
        const base64Image = btoa(binaryString);

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                    ]
                }],
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        if (!geminiResp.ok) {
            const errorText = await geminiResp.text();
            console.error('Gemini API Error:', errorText);
            throw new Error(`Gemini API request failed: ${geminiResp.status} - ${errorText}`);
        }

        const geminiData = await geminiResp.json()
        if (!geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Invalid Gemini Response Structure:', JSON.stringify(geminiData));
            throw new Error('Gemini returned an empty or invalid response');
        }

        let idResult;
        try {
            const rawText = geminiData.candidates[0].content.parts[0].text;
            idResult = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
        } catch (e) {
            console.error('Failed to parse Gemini JSON:', e);
            throw new Error('Could not parse identification result');
        }

        // GHOST MODE: Return AI result without database writes
        if (isGhostMode) {
            console.log('Ghost Mode: Returning AI result only (no DB writes)');
            return new Response(
                JSON.stringify({
                    success: true,
                    itemId: null,
                    identification: idResult,
                    ghostMode: true,
                    message: 'Item identified but not saved. Log in to save to your collection.'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 4. Manage Global Assets (Blueprint Section 7) - Only for authenticated users
        const assetId = idResult.market.asset_identifier || `${idResult.identity.country}_${idResult.identity.year}_${idResult.identity.denomination}`.replace(/\s+/g, '_');
        const { data: asset, error: assetError } = await supabaseClient
            .from('global_assets')
            .upsert({
                asset_identifier: assetId,
                name: idResult.identity.name,
                category: idResult.category.toLowerCase(),
                metadata: { ...idResult.identity, ...idResult.condition }
            }, { onConflict: 'asset_identifier' })
            .select()
            .single()

        if (assetError) throw assetError

        // 5. Find or Create default vault
        let { data: vault } = await supabaseClient
            .from('vaults')
            .select('id')
            .eq('user_id', user!.id)
            .limit(1)
            .maybeSingle()

        if (!vault) {
            const { data: newVault, error: createError } = await supabaseClient
                .from('vaults')
                .insert({ user_id: user!.id, name: 'Mijn Collectie' })
                .select('id')
                .single()
            if (createError) throw createError
            vault = newVault
        }

        // 6. Create User Item (Blueprint DB Alignment)
        const { data: newItem, error: itemError } = await supabaseClient
            .from('items')
            .insert({
                user_id: user!.id,
                vault_id: vault?.id,
                name: idResult.identity.name,
                category: idResult.category.toLowerCase(),
                image_url: imageUrl,
                metadata: idResult.identity,
                market_price: idResult.market.estimated_value,
                condition_report: idResult.condition,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (itemError) throw itemError

        // 7. Increment Profile Item Count
        await supabaseClient
            .from('profiles')
            .update({ item_count: (profile?.item_count || 0) + 1 })
            .eq('id', user!.id)

        return new Response(
            JSON.stringify({ success: true, itemId: newItem.id, identification: idResult }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        Sentry.captureException(error)
        return new Response(
            JSON.stringify({ success: false, error: 'EDGE_FUNCTION_ERROR', message: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
