import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { user_id, format } = await req.json();

        if (!user_id) {
            return new Response("Missing user_id", { status: 400, headers: corsHeaders });
        }

        // Fetch items
        const { data: items, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user_id);

        if (error) {
            throw error;
        }

        let fileContent = '';
        let contentType = '';
        let extension = '';

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Name', 'Category', 'Year', 'Country', 'Grade', 'Purchase Price', 'Market Price', 'Notes'];
            const rows = items.map(item => [
                item.name,
                item.category,
                item.metadata?.year || '',
                item.metadata?.country || '',
                item.condition_report?.grade || '',
                item.purchase_price || 0,
                item.market_price || 0,
                item.condition_report?.notes || ''
            ]);

            fileContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            contentType = 'text/csv';
            extension = 'csv';

        } else if (format === 'pdf') {
            // Placeholder for PDF (Simple HTML for now as PDF lib is heavy)
            // In real world we would use jspdf or pdf-lib
            // For MVP we can return a simple text report
            fileContent = `EXPORT REPORT\n\nItems: ${items.length}\n\n` +
                items.map(i => `${i.name} - ${i.market_price}`).join('\n');
            contentType = 'text/plain';
            extension = 'txt'; // Keep it simple for MVP
        } else {
            return new Response("Invalid format", { status: 400, headers: corsHeaders });
        }

        // Upload to Storage
        const fileName = `exports/${user_id}_${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase
            .storage
            .from('images') // Re-using images bucket for mvp, ideally 'exports' bucket
            .upload(fileName, fileContent, {
                contentType: contentType,
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // Create Signed URL
        const { data: signedUrl } = await supabase
            .storage
            .from('images')
            .createSignedUrl(fileName, 60); // 60 seconds validity

        return new Response(JSON.stringify({ url: signedUrl?.signedUrl }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (err) {
        console.error("Export failed:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
