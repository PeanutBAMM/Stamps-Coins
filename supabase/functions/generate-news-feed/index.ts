import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { corsHeaders, getServiceRoleClient, handleError, handleSuccess, initSentry } from "../_shared/utils.ts";

// Initialize Sentry
initSentry();

const RSS_FEEDS = [
    { url: "https://www.coinworld.com/rss/news", category: "coin", source: "CoinWorld" },
    { url: "https://www.linns.com/rss/news", category: "stamp", source: "Linn's Stamp News" },
];

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = getServiceRoleClient();
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
        if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured')

        const allArticles: any[] = [];

        // 1. Fetch and Parse RSS Feeds
        for (const feed of RSS_FEEDS) {
            try {
                const response = await fetch(feed.url);
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "text/html");

                if (!doc) continue;

                const items = doc.querySelectorAll("item");
                items.forEach((item: any, index: number) => {
                    if (index > 5) return;
                    const title = item.querySelector("title")?.textContent || "";
                    const link = item.querySelector("link")?.textContent || "";
                    const desc = item.querySelector("description")?.textContent || "";

                    if (title && link) {
                        allArticles.push({
                            title,
                            link,
                            description: desc.substring(0, 200),
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
            return handleSuccess({ message: "No articles found", processed: 0 });
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
            "image_url": "String (use specific placeholder: 'https://via.placeholder.com/300?text=News')" 
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
                }, { onConflict: 'title' })

            if (!error) results.push(item.title);
        }

        return handleSuccess({ processed: results.length, items: results });

    } catch (error: any) {
        return await handleError(error, req);
    }
})
