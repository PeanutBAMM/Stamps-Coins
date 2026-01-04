import React, { useState, useEffect, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isGhost: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        authService.getSession().then((currSession) => {
            setSession(currSession);
            setUser(currSession?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = authService.onAuthStateChange((_event, currSession) => {
            setSession(currSession);
            setUser(currSession?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        setLoading(true);
        try {
            await authService.signOut();
        } finally {
            setLoading(false);
        }
    };

    const isGhost = user?.is_anonymous ?? false;

    return (
        <AuthContext.Provider value={{ user, session, loading, isGhost, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
