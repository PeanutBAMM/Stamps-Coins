import { supabase } from '../api/supabase';
import { Session, User } from '@supabase/supabase-js';

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
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
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
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
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
     * Sign Out
     */
    async signOut() {
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
