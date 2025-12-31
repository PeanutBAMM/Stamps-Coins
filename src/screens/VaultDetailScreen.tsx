import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../constants/theme';
import { itemService } from '../services/itemService';
import { Item } from '../types/item.types';
import { Search, Filter, Grid, List as ListIcon, ArrowLeft } from 'lucide-react-native';

export default function VaultDetailScreen({ route, navigation }: any) {
    const { vaultId, vaultName } = route.params;
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    useFocusEffect(
        useCallback(() => {
            loadItems();
        }, [vaultId])
    );

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await itemService.getItemsByVault(vaultId);
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: Item }) => {
        if (viewMode === 'grid') {
            return (
                <TouchableOpacity
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                >
                    <Image source={{ uri: item.image_url }} style={styles.gridImage} />
                    <View style={styles.gridContent}>
                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.itemPrice}>€ {item.current_price?.toFixed(2) || '0.00'}</Text>
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                style={styles.listItem}
                onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
            >
                <Image source={{ uri: item.image_url }} style={styles.listImage} />
                <View style={styles.listContent}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription} numberOfLines={1}>{item.description}</Text>
                </View>
                <Text style={styles.itemPrice}>€ {item.current_price?.toFixed(2) || '0.00'}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>{vaultName}</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Search color={theme.colors.textSecondary} size={20} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Zoeken in kluis..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.iconButton} onPress={() => { }}>
                    <Filter color={theme.colors.text} size={20} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <ListIcon color={theme.colors.text} size={20} /> : <Grid color={theme.colors.text} size={20} />}
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                numColumns={viewMode === 'grid' ? 2 : 1}
                key={viewMode} // Force re-render when numColumns changes
                contentContainerStyle={styles.list}
                columnWrapperStyle={viewMode === 'grid' ? styles.columnWrapper : undefined}
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
        paddingTop: theme.spacing.xl + 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: theme.spacing.sm,
        color: theme.colors.text,
        fontSize: 16,
    },
    iconButton: {
        width: 48,
        height: 48,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    list: {
        padding: theme.spacing.lg,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    gridItem: {
        width: '48%',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    gridImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#333',
    },
    gridContent: {
        padding: theme.spacing.md,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: theme.colors.secondary,
        fontWeight: 'bold',
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        marginBottom: theme.spacing.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#333',
    },
    listContent: {
        flex: 1,
        marginLeft: theme.spacing.md,
    },
    itemDescription: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
});
