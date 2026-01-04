import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export const FeatureComparison = () => {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerText}></Text>
                <Text style={styles.headerText}>Free</Text>
                <Text style={styles.headerTextPro}>PRO</Text>
            </View>

            <FeatureRow label="Max Items" free="35" pro="∞" />
            <FeatureRow label="AI Identificatie" free="✓" pro="✓" />
            <FeatureRow label="Marktwaardes" free="Dagelijks" pro="Real-time" />
            <FeatureRow label="Prijs Historie" free="-" pro="2 Jaar" />
            <FeatureRow label="Export (CSV/PDF)" free="-" pro="✓" />
            <FeatureRow label="Cloud Sync" free="-" pro="✓" />
        </View>
    );
};

const FeatureRow = ({ label, free, pro }: { label: string, free: string, pro: string }) => (
    <View style={styles.row}>
        <Text style={styles.labelText}>{label}</Text>
        <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{free}</Text>
        </View>
        <View style={styles.valueContainer}>
            <Text style={[styles.valueText, styles.proText]}>{pro}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    headerTextPro: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    labelText: {
        flex: 1.5,
        color: theme.colors.text,
        fontSize: 14,
    },
    valueContainer: {
        flex: 1,
        alignItems: 'center',
    },
    valueText: {
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    proText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
