import { supabase } from '../api/supabase';
import { Vault, CreateVaultDTO, UpdateVaultDTO, VaultType } from '../types/vault.types';
import { errorService } from './errorService';

export const vaultService = {
    /**
     * Get all vaults for the current user
     * Includes item count and total value calculation
     */
    async getVaults(): Promise<Vault[]> {
        try {
            const { data: vaults, error } = await supabase
                .from('vaults')
                .select(`
            *,
            items:items (count),
            items_value:items (market_price, manual_value)
          `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform result to include aggregation
            return (vaults || []).map((vault: any) => ({
                ...vault,
                item_count: vault.items[0]?.count || 0,
                total_value: vault.items_value?.reduce((sum: number, item: any) => {
                    const price = item.manual_value ?? item.market_price ?? 0;
                    return sum + Number(price);
                }, 0) || 0,
            }));
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.getVaults');
            throw error;
        }
    },

    /**
     * Get a single vault by ID
     */
    async getVault(id: string): Promise<Vault> {
        try {
            const { data, error } = await supabase
                .from('vaults')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.getVault', { vaultId: id });
            throw error;
        }
    },

    /**
     * Create a new vault
     */
    async createVault(vaultData: CreateVaultDTO): Promise<Vault> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('vaults')
                .insert([
                    {
                        ...vaultData,
                        user_id: user.id,
                    },
                ])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.createVault', { vaultName: vaultData.name });
            throw error;
        }
    },

    /**
     * Update an existing vault
     */
    async updateVault(id: string, updates: UpdateVaultDTO): Promise<Vault> {
        try {
            const { data, error } = await supabase
                .from('vaults')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.updateVault', { vaultId: id });
            throw error;
        }
    },

    /**
     * Delete a vault
     * Note: This will fail if there are items in the vault unless ON DELETE CASCADE is set
     * or we handle item migration first.
     */
    async deleteVault(id: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('vaults')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.deleteVault', { vaultId: id });
            throw error;
        }
    },

    /**
     * Move an item to a different vault
     */
    async moveItem(itemId: string, targetVaultId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('items')
                .update({ vault_id: targetVaultId })
                .eq('id', itemId);

            if (error) throw error;
        } catch (error: any) {
            errorService.handleError(error, 'vaultService.moveItem', { itemId, targetVaultId });
            throw error;
        }
    }
};
