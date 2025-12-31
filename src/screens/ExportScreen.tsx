import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { exportService } from '../services/exportService';
import { useAuth } from '../hooks/useAuth';
import { useProStatus } from '../hooks/useProStatus';

export default function ExportScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { isPro } = useProStatus();
    const [loading, setLoading] = useState(false);

    const handleExport = async (format: 'csv' | 'pdf') => {
        if (!user) return;

        if (format === 'pdf' && !isPro) {
            Alert.alert('Pro Feature', 'PDF export is alleen beschikbaar voor Pro leden.');
            return;
        }

        setLoading(true);
        try {
            await exportService.generateExport(user.id, format);
            Alert.alert('Succes', `Je ${format.toUpperCase()} export is gestart.`);
        } catch (error: any) {
            Alert.alert('Fout', error.message || 'Export mislukt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Export Data</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    Download een overzicht van je volledige collectie.
                </Text>

                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleExport('csv')}
                    disabled={loading}
                >
                    <Ionicons name="document-text-outline" size={32} color={theme.colors.primary} />
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>CSV Export</Text>
                        <Text style={styles.cardDesc}>Compatibel met Excel / Google Sheets</Text>
                    </View>
                    <Ionicons name="download-outline" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, !isPro && styles.disabledCard]}
                    onPress={() => handleExport('pdf')}
                    disabled={loading}
                >
                    <Ionicons name="document-outline" size={32} color={isPro ? theme.colors.primary : theme.colors.textSecondary} />
                    <View style={styles.cardContent}>
                        <View style={styles.row}>
                            <Text style={[styles.cardTitle, !isPro && styles.disabledText]}>PDF Rapport</Text>
                            {!isPro && <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>}
                        </View>
                        <Text style={styles.cardDesc}>Mooi opgemaakt rapport (Binnenkort)</Text>
                    </View>
                    <Ionicons name={isPro ? "download-outline" : "lock-closed-outline"} size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>

                {loading && <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: theme.spacing.md,
        color: theme.colors.text,
    },
    content: {
        padding: theme.spacing.xl,
    },
    description: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        marginBottom: theme.spacing.xl,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    disabledCard: {
        opacity: 0.7,
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
    },
    cardContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    disabledText: {
        color: theme.colors.textSecondary,
    },
    cardDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    loader: {
        marginTop: theme.spacing.xl,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    proBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    proText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
