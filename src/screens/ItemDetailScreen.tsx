import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoachMark } from '../components/CoachMark';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { itemService } from '../services/itemService';
import { vaultService } from '../services/vaultService';
import { Item } from '../types/item.types';
import { Vault } from '../types/vault.types';
import PriceChart from '../components/PriceChart';
import ConditionBadge from '../components/ConditionBadge';
import PriceSuggestionModal from '../components/PriceSuggestionModal';
import { ArrowLeft, Trash2, Edit2, FolderInput } from 'lucide-react-native';

export default function ItemDetailScreen({ navigation, route }: any) {
    const { itemId } = route.params;
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
    const [vaults, setVaults] = useState<Vault[]>([]);
    const [moveModalVisible, setMoveModalVisible] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const checkFirstVisit = async () => {
            const hasVisited = await AsyncStorage.getItem('hasVisitedItemDetail');
            if (!hasVisited) {
                setIsFirstVisit(true);
                await AsyncStorage.setItem('hasVisitedItemDetail', 'true');
            }
        };
        checkFirstVisit();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadItem();
        }, [itemId])
    );

    const loadItem = async () => {
        try {
            setLoading(true);
            const data = await itemService.getItem(itemId);
            setItem(data);

            // Mock: Randomly trigger suggestion modal for demo if not ignored
            if (!data.ignore_market_updates && Math.random() > 0.7) {
                // In a real app this would be driven by a 'new_price_available' flag in DB
                setSuggestionModalVisible(true);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Fout', 'Kon item niet laden');
        } finally {
            setLoading(false);
        }
    };

    const handleMovePress = async () => {
        try {
            const vaultData = await vaultService.getVaults();
            setVaults(vaultData);
            setMoveModalVisible(true);
        } catch (error) {
            Alert.alert('Fout', 'Kon kluizen niet laden');
        }
    };

    const moveItemToVault = async (targetVaultId: string) => {
        try {
            await vaultService.moveItem(itemId, targetVaultId);
            setMoveModalVisible(false);
            Alert.alert('Succes', 'Item verplaatst!');
            // Refresh item or go back?
            loadItem();
        } catch (error) {
            Alert.alert('Fout', 'Kon item niet verplaatsen');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Item verwijderen',
            'Weet je zeker dat je dit item wilt verwijderen?',
            [
                { text: 'Annuleren', style: 'cancel' },
                {
                    text: 'Verwijderen',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await itemService.deleteItem(itemId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Fout', 'Kon item niet verwijderen');
                        }
                    }
                }
            ]
        );
    };

    const handleManualPrice = () => {
        Alert.prompt(
            'Handmatige Waarde',
            'Voer een eigen waarde in voor dit item:',
            [
                { text: 'Annuleren', style: 'cancel' },
                {
                    text: 'Opslaan',
                    onPress: async (value?: string) => {
                        const num = parseFloat(value || '0');
                        if (!isNaN(num)) {
                            await itemService.setManualValue(itemId, num);
                            loadItem();
                        }
                    }
                }
            ],
            'plain-text',
            item?.manual_value?.toString() || item?.market_price.toString()
        );
    };

    if (loading || !item) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft color={theme.colors.primary} size={24} />
                        <Text style={styles.backText}>Terug</Text>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={handleMovePress} style={styles.actionButton}>
                            <FolderInput color={theme.colors.text} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                            <Trash2 color="red" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Text style={styles.icon}>🖼️</Text>
                    </View>
                )}

                <View style={styles.details}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.category}>{item.category} • {item.country} {item.year}</Text>
                            <Text style={styles.title}>{item.name}</Text>
                            {isFirstVisit && (
                                <CoachMark
                                    text="Diepe duik in elk object"
                                    style={{ top: 40, left: 0 }}
                                />
                            )}
                        </View>
                        <ConditionBadge condition={item.condition} confidence={item.confidence_score} />
                    </View>

                    <View style={styles.priceContainer}>
                        <View>
                            <Text style={styles.priceLabel}>
                                {item.manual_value ? 'Handmatige Waarde' : 'Huidige Marktwaarde'}
                            </Text>
                            <Text style={styles.price}>
                                € {(item.manual_value ?? item.market_price).toFixed(2)}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={handleManualPrice}>
                            <Edit2 color="#fff" size={16} />
                        </TouchableOpacity>
                    </View>

                    <PriceChart data={[
                        { date: '2024-01', price: item.market_price * 0.9 },
                        { date: '2024-02', price: item.market_price * 0.95 },
                        { date: '2024-03', price: item.market_price }
                    ]} />

                    <View style={styles.specsContainer}>
                        <Text style={styles.sectionTitle}>Specificaties</Text>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Identificatie</Text>
                            <Text style={styles.specValue}>{item.description}</Text>
                        </View>
                        <View style={styles.specRow}>
                            <Text style={styles.specLabel}>Materiaal</Text>
                            <Text style={styles.specValue}>{item.material || '-'}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <PriceSuggestionModal
                visible={suggestionModalVisible}
                onClose={() => setSuggestionModalVisible(false)}
                currentPrice={item.market_price}
                newPrice={item.market_price * 1.15} // Mock update
                onAccept={async () => {
                    // Update logic (mock)
                    setSuggestionModalVisible(false);
                }}
                onIgnore={async () => {
                    await itemService.ignoreMarketSuggestions(item.id, true);
                    setSuggestionModalVisible(false);
                }}
            />

            <Modal visible={moveModalVisible} transparent animationType="slide" onRequestClose={() => setMoveModalVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Verplaats naar kluis</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {vaults.map(vault => (
                                <TouchableOpacity
                                    key={vault.id}
                                    style={[styles.vaultOption, vault.id === item?.vault_id && styles.activeVault]}
                                    onPress={() => moveItemToVault(vault.id)}
                                >
                                    <Text style={[styles.vaultOptionText, vault.id === item?.vault_id && styles.activeVaultText]}>
                                        {vault.name}
                                    </Text>
                                    {vault.id === item?.vault_id && <Text style={styles.activeLabel}>(Huidig)</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setMoveModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Annuleren</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        paddingTop: theme.spacing.xl,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    image: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
    },
    imagePlaceholder: {
        width: '100%',
        height: 300,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 64,
    },
    details: {
        padding: theme.spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.lg,
    },
    category: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginRight: 10,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.lg,
        borderRadius: 16,
        marginBottom: theme.spacing.lg,
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
    editButton: {
        backgroundColor: theme.colors.primary,
        padding: 10,
        borderRadius: 20,
    },
    specsContainer: {
        marginTop: theme.spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    specRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    specLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    specValue: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        padding: 4,
    },
    // Modal Styles
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
    },
    vaultOption: {
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeVault: {
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    vaultOptionText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    activeVaultText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    activeLabel: {
        fontSize: 12,
        color: theme.colors.primary,
    },
    closeButton: {
        padding: theme.spacing.lg,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    closeButtonText: {
        color: theme.colors.secondary,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
