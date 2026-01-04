import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getServiceRoleClient, handleError, handleSuccess, initSentry } from "../_shared/utils.ts"

// Initialize Sentry
initSentry();

/**
 * Daily Snapshot Edge Function
 * - Runs nightly via cron
 * - Calculates total portfolio value for all users
 * - Inserts into portfolio_history
 */
serve(async (req) => {
    try {
        const supabase = getServiceRoleClient();

        // 1. Get all users
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()
        if (userError) throw userError

        console.log(`Processing snapshots for ${users.users.length} users...`)
        const results = []

        for (const user of users.users) {
            // 2. Calculate Total Value for User
            const { data: items, error: itemsError } = await supabase
                .from('items')
                .select('market_price, manual_value')
                .eq('user_id', user.id)

            if (itemsError) {
                console.error(`Error fetching items for user ${user.id}:`, itemsError)
                continue
            }

            const totalValue = items?.reduce((sum, item) => {
                const price = item.manual_value ?? item.market_price ?? 0
                return sum + Number(price)
            }, 0) || 0

            // 3. Insert Snapshot
            const { error: insertError } = await supabase
                .from('portfolio_history')
                .insert({
                    user_id: user.id,
                    total_value: totalValue,
                    date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
                })

            if (insertError) {
                if (insertError.code === '23505') { // Unique violation (already ran today)
                    results.push({ userId: user.id, status: 'skipped_duplicate' })
                } else {
                    console.error(`Error saving snapshot for user ${user.id}:`, insertError)
                    results.push({ userId: user.id, status: 'error', error: insertError.message })
                }
            } else {
                results.push({ userId: user.id, status: 'success', value: totalValue })
            }
        }

        return handleSuccess({ processed: results.length, details: results });

    } catch (error: any) {
        return await handleError(error, req);
    }
})
