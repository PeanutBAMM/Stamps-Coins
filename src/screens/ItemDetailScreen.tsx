import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

export default function ItemDetailScreen({ navigation, route }: any) {
    const { itemId } = route.params || {};

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Terug</Text>
            </TouchableOpacity>

            <View style={styles.imagePlaceholder}>
                <Text style={styles.icon}>🖼️</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.category}>Postzegel • NL 1924</Text>
                <Text style={styles.title}>Wilhelmina Vlieger 10c</Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>Geschatte Waarde</Text>
                    <Text style={styles.price}>€ 45,00</Text>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Conditie</Text>
                        <Text style={styles.infoValue}>Postfris</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>Zeldzaamheid</Text>
                        <Text style={styles.infoValue}>Common</Text>
                    </View>
                </View>
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
    backButton: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    backText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    imagePlaceholder: {
        width: '100%',
        height: 300,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    icon: {
        fontSize: 64,
    },
    details: {
        padding: theme.spacing.xs,
    },
    category: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
    },
    priceContainer: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.xl,
    },
    priceLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    price: {
        color: theme.colors.secondary,
        fontSize: 32,
        fontWeight: 'bold',
    },
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoBox: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: 12,
    },
    infoLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: 4,
    },
    infoValue: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    }
});
