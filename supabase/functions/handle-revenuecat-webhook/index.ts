import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const REVENUECAT_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
    // 1. Validate Secret Header
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== REVENUECAT_SECRET && authHeader !== `Bearer ${REVENUECAT_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { event } = await req.json();
        const { type, app_user_id } = event;

        console.log(`Received event: ${type} for user: ${app_user_id}`);

        if (!app_user_id) {
            return new Response("No user_id", { status: 200 }); // Ignore
        }

        let proStatus = false;

        // 2. Map Events to Status
        switch (type) {
            case "INITIAL_PURCHASE":
            case "RENEWAL":
            case "UNCANCELLATION":
                proStatus = true;
                break;
            case "CANCELLATION":
            case "EXPIRATION":
            case "BILLING_ISSUE":
                proStatus = false;
                break;
            default:
                // Other events (e.g. TEST) don't change status directly without entitlements check
                // But for MVP we can log them.
                console.log(`Unhandled event type: ${type}`);
                return new Response("Event logged", { status: 200 });
        }

        // 3. Update Profile
        const { error } = await supabase
            .from("profiles")
            .update({ pro_status: proStatus })
            .eq("id", app_user_id);

        if (error) {
            console.error("Database update failed:", error);
            return new Response("Database error", { status: 500 });
        }

        // 4. Log Event (Accessory)
        console.log(`Updated pro_status to ${proStatus} for user ${app_user_id}`);

        return new Response("Webook processed", { status: 200 });

    } catch (err) {
        console.error("Webhook processing failed:", err);
        return new Response("Server error", { status: 500 });
    }
});
