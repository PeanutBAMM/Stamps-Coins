import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Daily Snapshot Edge Function
 * - Runs nightly via cron
 * - Calculates total portfolio value for all users
 * - Inserts into portfolio_history
 */
Deno.serve(async (req) => {
    try {
        // 1. Get all users
        const { data: users, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) throw userError

        console.log(`Processing snapshots for ${users.users.length} users...`)

        const results = []

        for (const user of users.users) {
            // 2. Calculate Total Value for User
            const { data: items, error: itemsError } = await supabase
                .from('items')
                .select('market_price, manual_price')
                .eq('user_id', user.id)

            if (itemsError) {
                console.error(`Error fetching items for user ${user.id}:`, itemsError)
                continue
            }

            const totalValue = items?.reduce((sum, item) => {
                const price = item.manual_price ?? item.market_price ?? 0
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

        return new Response(
            JSON.stringify({ success: true, processed: results.length, details: results }),
            { headers: { 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { headers: { 'Content-Type': 'application/json' }, status: 500 },
        )
    }
})
