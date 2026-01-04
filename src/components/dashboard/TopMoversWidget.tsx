import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { AssetPerformance } from '../../types/portfolio.types';
import { ChangeIndicator } from './ChangeIndicator';

interface TopMoversWidgetProps {
    movers: AssetPerformance[];
    isLoading?: boolean;
    onItemPress: (id: string) => void;
}

export const TopMoversWidget: React.FC<TopMoversWidgetProps> = ({
    movers,
    isLoading,
    onItemPress
}) => {
    if (movers.length === 0 && !isLoading) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Top Stijgers</Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {movers.map((item) => (
                    <TouchableOpacity
                        key={item.item_id}
                        style={styles.card}
                        onPress={() => onItemPress(item.item_id)}
                    >
                        <Image
                            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                            style={styles.image}
                        />
                        <View style={styles.cardContent}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.statsRow}>
                                <Text style={styles.price}>
                                    {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(item.current_value)}
                                </Text>
                                <ChangeIndicator changePercentage={item.change_percentage} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    scrollContent: {
        paddingHorizontal: 15,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: 160,
        marginLeft: 5,
        marginRight: 15, // Space between cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 100,
    },
    cardContent: {
        padding: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        color: '#1C1C1E',
    },
    statsRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
    }
});
