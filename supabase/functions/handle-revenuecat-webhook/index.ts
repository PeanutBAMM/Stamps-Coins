import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getServiceRoleClient, handleError, handleSuccess, initSentry } from "../_shared/utils.ts";

// Initialize Sentry
initSentry();

serve(async (req) => {
    try {
        const REVENUECAT_SECRET = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");

        // 1. Validate Secret Header
        const authHeader = req.headers.get("Authorization");
        if (authHeader !== REVENUECAT_SECRET && authHeader !== `Bearer ${REVENUECAT_SECRET}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        const supabase = getServiceRoleClient();
        const { event } = await req.json();
        const { type, app_user_id } = event;

        console.log(`Received event: ${type} for user: ${app_user_id}`);

        if (!app_user_id) {
            return handleSuccess({ message: "No user_id, ignored" });
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
                console.log(`Unhandled event type: ${type}`);
                return handleSuccess({ message: "Event logged, no status change" });
        }

        // 3. Update Profile
        const { error } = await supabase
            .from("profiles")
            .update({ pro_status: proStatus })
            .eq("id", app_user_id);

        if (error) throw error;

        console.log(`Updated pro_status to ${proStatus} for user ${app_user_id}`);

        return handleSuccess({ status: 'updated', userId: app_user_id, proStatus });

    } catch (error: any) {
        return await handleError(error, req);
    }
});
