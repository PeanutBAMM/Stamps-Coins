import { supabase } from '../api/supabase';
import { Session, User } from '@supabase/supabase-js';
import { errorService } from './errorService';

export const authService = {
    /**
     * Get the current session
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },

    /**
     * Get the current user
     */
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    /**
     * Anonymous Sign In (Ghost Mode)
     */
    async signInAnonymously() {
        errorService.addBreadcrumb({ category: 'auth', message: 'Anonymous sign in started' });
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        errorService.setUser(data.user?.id || null);
        return data;
    },

    /**
     * Sign Up with Email and Password
     */
    async signUp(email: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Sign In with Email and Password
     */
    async signIn(email: string, password: string) {
        errorService.addBreadcrumb({ category: 'auth', message: 'Email sign in started' });
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        errorService.setUser(data.user?.id || null, email);
        return data;
    },

    /**
     * Convert Ghost account to Email account
     * This updates the anonymous user with an email and password
     */
    async convertGhostToEmail(email: string, password: string) {
        const { data, error } = await supabase.auth.updateUser({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    /**
   * Update User Metadata (Shared across ghost and email users)
   */
    async updateMetadata(metadata: Record<string, any>) {
        const { data, error } = await supabase.auth.updateUser({
            data: metadata,
        });
        if (error) throw error;
        return data;
    },

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
     * Sign Out
     */
    async signOut() {
        errorService.addBreadcrumb({ category: 'auth', message: 'User signed out' });
        errorService.setUser(null);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    /**
     * Reset Password
     */
    async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'stampscoins://reset-password',
        });
        if (error) throw error;
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    },
};
