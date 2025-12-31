import { supabase } from '../api/supabase';
import { PortfolioHistory, PortfolioSummary, AssetPerformance } from '../types/portfolio.types';
import { Item } from '../types/item.types';

export const portfolioService = {
    /**
     * Calculates the total value of the user's portfolio.
     * Priority: Manual Price -> Market Price -> 0
     */
    async getTotalValue(userId: string): Promise<number> {
        const { data: items, error } = await supabase
            .from('items')
            .select('market_price, manual_price')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching total value:', error);
            throw error;
        }

        if (!items) return 0;

        return items.reduce((total, item) => {
            const price = item.manual_price ?? item.market_price ?? 0;
            return total + Number(price);
        }, 0);
    },

    /**
     * Retrieves the 24h change (value and percentage).
     * For MVP: Calculates current total vs most recent portfolio_history entry (max 24h old).
     * If no history exists, returns 0.
     */
    async get24hChange(userId: string): Promise<PortfolioSummary> {
        const currentTotal = await this.getTotalValue(userId);

        // Get the portfolio value from usually ~24h ago (or the latest previous snapshot)
        // For now, we take the latest snapshot strictly before today if possible, or just the latest one.
        // In a real app we'd query for `date = yesterday`.
        const { data: history, error } = await supabase
            .from('portfolio_history')
            .select('total_value, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
            console.error('Error fetching portfolio history:', error);
        }

        const previousTotal = history ? history.total_value : currentTotal; // Default to 0 change if no history

        // Prevent division by zero
        const changeValue = currentTotal - previousTotal;
        const changePercentage = previousTotal === 0 ? 0 : (changeValue / previousTotal) * 100;

        return {
            total_value: currentTotal,
            change_24h_value: changeValue,
            change_24h_percentage: changePercentage,
        };
    },

    /**
     * Retrieves portfolio history for charts.
     */
    async getHistory(userId: string, days: number = 30): Promise<PortfolioHistory[]> {
        const { data, error } = await supabase
            .from('portfolio_history')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })
            .limit(days);

        if (error) {
            console.error('Error fetching portfolio history:', error);
            throw error;
        }

        return (data as PortfolioHistory[]) || [];
    },

    /**
     * Identifies top movers (items with highest value change).
     * LIMITATION: Without per-item history, we fallback to:
     * 1. Recent items (if 'created_at' is new)
     * 2. High value items
     * 
     * In a real implementation with `market_prices` history, we would join tables.
     * For this MVP Sprint 4, we will return empty or mock data if we can't calculate.
     */
    async getTopMovers(userId: string): Promise<AssetPerformance[]> {
        // PROVISIONAL: Fetch top 5 most valuable items as "Top Movers" for now
        // Since we don't have item-level history snapshots yet.
        const { data: items, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .order('current_price', { ascending: false }) // Assuming current_price is a consolidated field or market_price
            .limit(5);

        if (error) {
            console.error('Error fetching top movers:', error);
            return [];
        }

        // Map to AssetPerformance
        return items?.map(item => ({
            item_id: item.id,
            name: item.name,
            image_url: item.image_url,
            current_value: item.manual_price ?? item.market_price ?? 0,
            change_percentage: 0, // No history yet
            change_value: 0
        })) || [];
    },

    /**
     * Records a daily snapshot of the total portfolio value.
     * Should be called by a cron job or on first app open of the day.
     */
    async recordDailySnapshot(userId: string): Promise<void> {
        const today = new Date().toISOString().split('T')[0];

        // Check if snapshot exists for today
        const { data: existing } = await supabase
            .from('portfolio_history')
            .select('id')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (existing) return; // Already recorded

        const totalValue = await this.getTotalValue(userId);

        const { error } = await supabase
            .from('portfolio_history')
            .insert({
                user_id: userId,
                total_value: totalValue,
                date: today
            });

        if (error) {
            console.error('Error recording daily snapshot:', error);
        }
    }

};
