import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

const MOCK_VAULTS = [
    { id: '1', name: 'Mijn Postzegels', itemCount: 12, value: 450.50, type: 'Stamps' },
    { id: '2', name: 'Zeldzame Munten', itemCount: 5, value: 1200.00, type: 'Coins' },
];

export default function VaultsScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Mijn Kluizen</Text>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addText}>+ Nieuw</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={MOCK_VAULTS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.vaultCard}
                        onPress={() => navigation.navigate('VaultDetail', { vaultId: item.id, vaultName: item.name })}
                    >
                        <View>
                            <Text style={styles.vaultName}>{item.name}</Text>
                            <Text style={styles.vaultDetails}>{item.itemCount} items • {item.type}</Text>
                        </View>
                        <Text style={styles.vaultValue}>€ {item.value.toFixed(2)}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    addText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    list: {
        padding: theme.spacing.lg,
    },
    vaultCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    vaultName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    vaultDetails: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    vaultValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    }
});
