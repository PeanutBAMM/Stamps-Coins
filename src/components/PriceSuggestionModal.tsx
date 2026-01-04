import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { TrendingUp, AlertTriangle } from 'lucide-react-native';

interface PriceSuggestionModalProps {
    visible: boolean;
    onClose: () => void;
    currentPrice: number;
    newPrice: number;
    onAccept: () => void;
    onIgnore: () => void;
}

export default function PriceSuggestionModal({
    visible, onClose, currentPrice, newPrice, onAccept, onIgnore
}: PriceSuggestionModalProps) {
    const diff = newPrice - currentPrice;
    const percent = (diff / currentPrice) * 100;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <TrendingUp size={32} color={theme.colors.primary} />
                    </View>

                    <Text style={styles.title}>Nieuwe Marktprijs!</Text>
                    <Text style={styles.description}>
                        We hebben een nieuwe marktwaarde gevonden voor dit item. Wil je de prijs updaten?
                    </Text>

                    <View style={styles.comparison}>
                        <View style={styles.priceBlock}>
                            <Text style={styles.label}>Oud</Text>
                            <Text style={styles.oldPrice}>€ {currentPrice.toFixed(2)}</Text>
                        </View>
                        <View style={styles.arrow}><Text style={{ color: theme.colors.text }}>→</Text></View>
                        <View style={styles.priceBlock}>
                            <Text style={styles.label}>Nieuw</Text>
                            <Text style={styles.newPrice}>€ {newPrice.toFixed(2)}</Text>
                            <Text style={[styles.diff, { color: diff > 0 ? '#4CAF50' : '#F44336' }]}>
                                {diff > 0 ? '+' : ''}{percent.toFixed(1)}%
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.ignoreButton} onPress={onIgnore}>
                            <Text style={styles.ignoreText}>Negeren</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                            <Text style={styles.acceptText}>Update Prijs</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    content: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    description: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    comparison: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.xl,
    },
    priceBlock: {
        alignItems: 'center',
    },
    arrow: {
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    oldPrice: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    newPrice: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    diff: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        width: '100%',
        gap: theme.spacing.md,
    },
    ignoreButton: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    ignoreText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        padding: theme.spacing.md,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
