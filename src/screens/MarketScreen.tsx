import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { theme } from '../constants/theme';

export default function MarketScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Marktinzichten</Text>

            <View style={styles.marketCard}>
                <Text style={styles.marketLabel}>Markt Trend</Text>
                <Text style={styles.marketValue}>Bullish</Text>
            </View>

            <View style={styles.newsSection}>
                <Text style={styles.sectionTitle}>Laatste Nieuws</Text>
                <Text style={styles.comingSoon}>Verzamel-nieuwsfeed komt binnenkort...</Text>
            </View>
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    marketCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    marketLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    marketValue: {
        color: theme.colors.secondary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    newsSection: {
        marginTop: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    comingSoon: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    }
});
