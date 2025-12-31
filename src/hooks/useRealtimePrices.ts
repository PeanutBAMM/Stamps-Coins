import { useEffect } from 'react';
import { supabase } from '../api/supabase';

/**
 * Hook to subscribe to realtime changes in the database.
 * Currently listens for changes in the 'items' table for the current user,
 * to trigger a refresh of the portfolio value.
 */
export const useRealtimePrices = (userId: string | undefined, onUpdate: () => void) => {
    useEffect(() => {
        if (!userId) return;

        // Create a channel for realtime updates
        const subscription = supabase
            .channel('portfolio-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'items',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    onUpdate();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [userId, onUpdate]);
};
