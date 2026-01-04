import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"
import * as Sentry from "https://esm.sh/@sentry/deno@8.26.0"

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Initialize Sentry for Edge Functions
 * Uses Deno.env to load DSN from environment variables.
 */
export function initSentry() {
    const dsn = Deno.env.get('SENTRY_DSN');
    if (!dsn) {
        console.warn('SENTRY_DSN not found, Sentry is disabled');
        return;
    }

    Sentry.init({
        dsn,
        environment: Deno.env.get('SENTRY_ENVIRONMENT') || 'production',
        tracesSampleRate: 1.0,
    });
}

/**
 * Centralized async Error handling for Edge Functions
 * Captures to Sentry and ensures flush() is called before termination.
 */
export async function handleError(error: any, req?: Request) {
    console.error(error);

    // Enhanced Sentry capture with request context
    Sentry.withScope((scope) => {
        if (req) {
            scope.setContext('request', {
                url: req.url,
                method: req.method,
                headers: Object.fromEntries(req.headers.entries()),
            });
        }
        Sentry.captureException(error);
    });

    // CRITICAL: Ensure Sentry events are sent before the function terminates
    await Sentry.flush(2000);

    return new Response(
        JSON.stringify({ success: false, error: error.message || 'An unexpected error occurred' }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: error.status || 400,
        }
    );
}

/**
 * Standardized Success response
 */
export function handleSuccess(data: any) {
    return new Response(
        JSON.stringify({ success: true, ...data }),
        {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        }
    );
}

/**
 * Get internal Supabase Client with service role permissions
 */
export function getServiceRoleClient() {
    return createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
}

/**
 * Get both public (user-bound) and admin Supabase clients
 */
export function getSupabaseClients(req: Request) {
    const authHeader = req.headers.get('Authorization')
    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader! } } }
    )

    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    return { supabaseClient, supabaseAdmin }
}
