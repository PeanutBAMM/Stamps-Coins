import { supabase } from '../api/supabase';
import { Item, UpdateItemDTO } from '../types/item.types';
import { errorService } from './errorService';
import { queryOptimizer } from './queryOptimizer';

export const itemService = {
    /**
     * Get all items for a specific vault
     * Uses caching for performance optimization
     */
    async getItemsByVault(vaultId: string): Promise<Item[]> {
        const cacheKey = `items_vault_${vaultId}`;

        // Check cache first
        const cached = await queryOptimizer.getFromCache<Item[]>(cacheKey);
        if (cached) return cached;

        // Fetch from database
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('vault_id', vaultId)
            .order('created_at', { ascending: false });

        if (error) {
            errorService.handleError(error, 'itemService.getItemsByVault', { vaultId });
            throw error;
        }

        // Cache result for 1 minute
        await queryOptimizer.setCache(cacheKey, data, 60000);

        return data;
    },

    /**
     * Get a single item by ID
     */
    async getItem(id: string): Promise<Item> {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update an item
     */
    async updateItem(id: string, updates: UpdateItemDTO): Promise<Item> {
        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete an item
     */
    async deleteItem(id: string): Promise<void> {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (error) {
            errorService.handleError(error, 'itemService.deleteItem', { id });
            throw error;
        }
    },

    /**
     * Set a manual price override
     */
    async setManualValue(id: string, price: number): Promise<Item> {
        return this.updateItem(id, { manual_value: price });
    },

    /**
   * Remove manual price override
   */
    async clearManualValue(id: string): Promise<Item> {
        return this.updateItem(id, { manual_value: null });
    },

    /**
     * Ignore market price updates for this item
     */
    async ignoreMarketSuggestions(id: string, ignore: boolean): Promise<Item> {
        return this.updateItem(id, { ignore_market_updates: ignore });
    }
};
