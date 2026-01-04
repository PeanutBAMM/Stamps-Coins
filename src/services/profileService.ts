import { supabase } from '../api/supabase';
import { errorService } from './errorService';

export const profileService = {
    /**
     * Get Profile from database
     */
    async getProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'profileService.getProfile', { userId });
            throw error;
        }
    },

    /**
     * Update Profile in database
     */
    async updateProfile(userId: string, updates: any) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);
            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'profileService.updateProfile', { userId });
            throw error;
        }
    },

    /**
     * Get item count for a user (placeholder logic for now)
     */
    async getItemCount(userId: string) {
        try {
            const { count, error } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);
            if (error) throw error;
            return count || 0;
        } catch (error: any) {
            errorService.handleError(error, 'profileService.getItemCount', { userId });
            throw error;
        }
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
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(settings)
                .eq('id', userId);
            if (error) throw error;
            return data;
        } catch (error: any) {
            errorService.handleError(error, 'profileService.updateSettings', { userId });
            throw error;
        }
    }
};
