import { supabase } from '../api/supabase';

export const profileService = {
    /**
     * Get Profile from database
     */
    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },

    /**
     * Update Profile in database
     */
    async updateProfile(userId: string, updates: any) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        if (error) throw error;
        return data;
    },

    /**
     * Get item count for a user (placeholder logic for now)
     */
    async getItemCount(userId: string) {
        const { count, error } = await supabase
            .from('items')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        if (error) throw error;
        return count || 0;
    },

    /**
     * Detect region based on localization
     */
    getRegion() {
        return 'EU'; // Default for MVP
    },

    /**
     * Update Profile Settings
     */
    async updateSettings(userId: string, settings: { currency?: string; region?: string }) {
        const { data, error } = await supabase
            .from('profiles')
            .update(settings)
            .eq('id', userId);
        if (error) throw error;
        return data;
    }
};
