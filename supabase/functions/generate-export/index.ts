import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, getServiceRoleClient, handleError, handleSuccess, initSentry } from "../_shared/utils.ts";

// Initialize Sentry
initSentry();

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = getServiceRoleClient();
        const { user_id, format } = await req.json();

        if (!user_id) {
            throw new Error("Missing user_id");
        }

        // Fetch items
        const { data: items, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', user_id);

        if (error) throw error;
        if (!items) throw new Error("No items found for user");

        let fileContent = '';
        let contentType = '';
        let extension = '';

        if (format === 'csv') {
            // Generate CSV
            const headers = ['Name', 'Category', 'Year', 'Country', 'Grade', 'Purchase Price', 'Market Price', 'Notes'];
            const rows = items.map((item: any) => [
                `"${item.name || ''}"`,
                item.category || '',
                item.metadata?.year || '',
                item.metadata?.country || '',
                item.condition_report?.grade || '',
                item.purchase_price || 0,
                item.market_price || 0,
                `"${(item.condition_report?.notes || '').replace(/"/g, '""')}"`
            ]);

            fileContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
            contentType = 'text/csv';
            extension = 'csv';

        } else if (format === 'pdf' || format === 'text') {
            // Placeholder for PDF (Simple text report for MVP)
            fileContent = `EXPORT REPORT\n\nItems: ${items.length}\n\n` +
                items.map((i: any) => `${i.name} - ${i.market_price} ${i.metadata?.currency || 'EUR'}`).join('\n');
            contentType = 'text/plain';
            extension = 'txt';
        } else {
            throw new Error("Invalid format requested");
        }

        // Upload to Storage
        const fileName = `exports/${user_id}_${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase
            .storage
            .from('images') // Re-using images bucket for mvp
            .upload(fileName, fileContent, {
                contentType: contentType,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Create Signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('images')
            .createSignedUrl(fileName, 300); // 5 minutes validity

        if (signedUrlError) throw signedUrlError;

        return handleSuccess({ url: signedUrlData?.signedUrl });

    } catch (err: any) {
        return await handleError(err, req);
    }
});
