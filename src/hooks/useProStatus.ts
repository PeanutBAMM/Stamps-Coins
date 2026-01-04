import { useState, useEffect } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { profileService } from '../services/profileService';
import { useAuth } from '../hooks/useAuth';

export const useProStatus = () => {
    const [isPro, setIsPro] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        checkStatus();
    }, [user]);

    const checkStatus = async () => {
        if (!user) {
            setIsPro(false);
            setLoading(false);
            return;
        }

        try {
            // Check 1: RevenueCat (Source of Truth for mobile purchases)
            const rcStatus = await subscriptionService.checkProStatus();
            if (rcStatus) {
                setIsPro(true);
                setLoading(false);
                return;
            }

            // Check 2: Database (e.g. granted via admin or web)
            const profile = await profileService.getProfile(user.id);
            if (profile?.pro_status) {
                setIsPro(true);
            } else {
                setIsPro(false);
            }
        } catch (error) {
            console.error('Error checking pro status:', error);
            setIsPro(false);
        } finally {
            setLoading(false);
        }
    };

    return { isPro, loading, checkStatus };
};
