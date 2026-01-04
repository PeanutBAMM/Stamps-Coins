import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RSS_FEEDS = [
    { url: "https://www.coinworld.com/rss/news", category: "coin", source: "CoinWorld" },
    { url: "https://www.linns.com/rss/news", category: "stamp", source: "Linn's Stamp News" },
    // Add more feeds as needed
];

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

        const allArticles = [];

        // 1. Fetch and Parse RSS Feeds
        for (const feed of RSS_FEEDS) {
            try {
                const response = await fetch(feed.url);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html"); // RSS is XML, but HTML parser often works for simple extracting

                if (!doc) continue;

                const items = doc.querySelectorAll("item");
                items.forEach((item, index) => {
                    if (index > 5) return; // Limit to latest 5 per feed to save tokens
                    const title = item.querySelector("title")?.textContent || "";
                    const link = item.querySelector("link")?.textContent || "";
                    const desc = item.querySelector("description")?.textContent || "";

                    if (title && link) {
                        allArticles.push({
                            title,
                            link,
                            description: desc.substring(0, 200), // Truncate
                            source: feed.source,
                            category: feed.category,
                            original_published: item.querySelector("pubDate")?.textContent
                        });
                    }
                });
            } catch (err) {
                console.error(`Failed to fetch feed ${feed.url}:`, err);
            }
        }

        if (allArticles.length === 0) {
            return new Response(JSON.stringify({ message: "No articles found" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 2. Curate with Gemini
        const prompt = `
        You are an expert editor for a Stamp & Coin collecting app.
        Review the following list of news articles.
        Select the top 6 most interesting and relevant articles for collectors.
        For each selected article:
        1. Summarize it in 1 short Dutch sentence.
        2. Assign a category: 'coin', 'stamp', or 'general'.
        3. Ensure the title is clean.
        
        Return a JSON array with objects:
        {
            "title": "String",
            "summary": "String (Dutch)",
            "source_name": "String",
            "source_url": "String",
            "category": "String",
            "image_url": "String (use specific placeholder if none: 'https://via.placeholder.com/300?text=News')" 
        }

        Input Articles:
        ${JSON.stringify(allArticles)}
        `;

        const geminiResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { response_mime_type: "application/json" }
            })
        })

        if (!geminiResp.ok) throw new Error('Gemini API request failed')
        const geminiData = await geminiResp.json()
        const curatedNews = JSON.parse(geminiData.candidates[0].content.parts[0].text)

        // 3. Save to Database
        const results = [];
        for (const item of curatedNews) {
            const { error } = await supabaseClient
                .from('news_feed')
                .upsert({
                    title: item.title,
                    summary: item.summary,
                    source_url: item.source_url,
                    source_name: item.source_name,
                    category: item.category,
                    image_url: item.image_url,
                    published_at: new Date().toISOString()
                }, { onConflict: 'title' }) // Simple dedup on title

            if (!error) results.push(item.title);
        }

        return new Response(
            JSON.stringify({ success: true, processed: results.length, items: results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error(error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
