import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';

export default function DashboardScreen({ navigation }: any) {
    const { user, isGhost } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await profileService.getProfile(user.id);
            setProfile(data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayName = profile?.username || (isGhost ? 'Verzamelaar' : user?.email?.split('@')[0]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Hallo,</Text>
                <Text style={styles.name}>{displayName}</Text>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Totale Waarde</Text>
                <Text style={styles.summaryValue}>€ 0,00</Text>
                <Text style={styles.summaryChange}>+ € 0,00 (vandaag)</Text>
            </View>

            <View style={styles.actionGrid}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Scanner')}
                >
                    <Text style={styles.actionIcon}>📸</Text>
                    <Text style={styles.actionText}>Scan Item</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Vaults')}
                >
                    <Text style={styles.actionIcon}>🔐</Text>
                    <Text style={styles.actionText}>Mijn Kluis</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>Recent Toegevoegd</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Je hebt nog geen items gescand.</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.profileButtonText}>Profiel beheren</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    welcome: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    summaryCard: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.xl,
        borderRadius: 20,
        marginBottom: theme.spacing.xl,
    },
    summaryLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        marginBottom: 4,
    },
    summaryValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryChange: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.xl,
    },
    actionButton: {
        backgroundColor: theme.colors.surface,
        width: '48%',
        padding: theme.spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: theme.spacing.sm,
    },
    actionText: {
        color: theme.colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    recentSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    emptyState: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    profileButton: {
        marginTop: theme.spacing.xl,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    profileButtonText: {
        color: theme.colors.primary,
        fontWeight: '600',
    }
});
