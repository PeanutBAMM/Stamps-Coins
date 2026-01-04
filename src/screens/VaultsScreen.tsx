import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, RefreshControl, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoachMark } from '../components/CoachMark';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { vaultService } from '../services/vaultService';
import { Vault, CreateVaultDTO } from '../types/vault.types';
import CreateVaultModal from '../components/CreateVaultModal';
import { Plus, Trash2, Package } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function VaultsScreen({ navigation }: any) {
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const checkFirstVisit = async () => {
            const hasVisited = await AsyncStorage.getItem('hasVisitedVaults');
            if (!hasVisited) {
                setIsFirstVisit(true);
                await AsyncStorage.setItem('hasVisitedVaults', 'true');
            }
        };
        checkFirstVisit();
    }, []);

    // useFocusEffect to reload data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadVaults();
        }, [])
    );

    const loadVaults = async () => {
        try {
            const data = await vaultService.getVaults();
            setVaults(data);
        } catch (error) {
            console.error('Error loading vaults:', error);
            Alert.alert('Fout', 'Kon kluizen niet laden.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreateVault = async (data: CreateVaultDTO) => {
        try {
            await vaultService.createVault(data);
            await loadVaults(); // Reload list
        } catch (error) {
            console.error('Error creating vault:', error);
            Alert.alert('Fout', 'Kon kluis niet aanmaken.');
            throw error; // Re-throw so modal stays open or handles it
        }
    };

    const handleDeleteVault = (id: string, name: string) => {
        Alert.alert(
            'Kluis verwijderen',
            `Weet je zeker dat je "${name}" wilt verwijderen? Items in deze kluis worden niet verwijderd maar worden mogelijk onzichtbaar tot ze verplaatst worden.`, // TODO: Be more specific about item handling later
            [
                { text: 'Annuleren', style: 'cancel' },
                {
                    text: 'Verwijderen',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await vaultService.deleteVault(id);
                            loadVaults();
                        } catch (error) {
                            console.error('Error deleting vault:', error);
                            Alert.alert('Fout', 'Kon kluis niet verwijderen.');
                        }
                    }
                }
            ]
        );
    };

    const renderRightActions = (id: string, name: string) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteVault(id, name)}
            >
                <Trash2 color="#fff" size={24} />
            </TouchableOpacity>
        );
    };

    const renderItem = ({ item }: { item: Vault }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id, item.name)}>
            <TouchableOpacity
                style={styles.vaultCard}
                onPress={() => navigation.navigate('VaultDetail', { vaultId: item.id, vaultName: item.name })}
                activeOpacity={0.7}
            >
                <View style={styles.cardIcon}>
                    <Package color={theme.colors.primary} size={24} />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.vaultName}>{item.name}</Text>
                    <Text style={styles.vaultDetails}>
                        {item.item_count} items • {item.type === 'Stamps' ? 'Postzegels' : item.type === 'Coins' ? 'Munten' : 'Gemengd'}
                    </Text>
                </View>
                <View style={styles.valueContainer}>
                    <Text style={styles.vaultValue}>€ {(item.total_value || 0).toFixed(2)}</Text>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Mijn Kluizen</Text>
                    {isFirstVisit && (
                        <CoachMark
                            text="Organiseer je bezit"
                            style={{ top: 40, left: 10 }}
                        />
                    )}
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Plus color="#fff" size={20} />
                    <Text style={styles.addText}>Nieuw</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={vaults}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVaults(); }} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Nog geen kluizen.</Text>
                            <Text style={styles.emptySubtext}>Maak er eentje aan om te beginnen!</Text>
                        </View>
                    ) : null
                }
            />

            <CreateVaultModal
                visible={isCreateModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onSubmit={handleCreateVault}
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
        paddingTop: theme.spacing.xl + 20, // Adjust for status bar if not handled by safe area
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.background, // Ensure solid background
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    list: {
        padding: theme.spacing.lg,
        paddingBottom: 100, // Space for FAB if we had one bottom-right, or just extra scroll space
    },
    vaultCard: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    cardContent: {
        flex: 1,
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
    valueContainer: {
        alignItems: 'flex-end',
    },
    vaultValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.secondary,
    },
    deleteAction: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%', // Match card height via styling or calculate
        marginBottom: theme.spacing.md,
        borderRadius: 16,
        // Note: Swipeable container might need styling to match margin
        marginLeft: 8,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 18,
        color: theme.colors.text,
        fontWeight: 'bold',
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
});
