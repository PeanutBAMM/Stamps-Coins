import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

const MOCK_NEWS = [
    {
        id: '1',
        title: 'Gouden Tientje stijgt in waarde',
        image: 'https://images.unsplash.com/photo-1579216091007-425785f78a7c?q=80&w=300&auto=format&fit=crop',
        source: 'Numisma News'
    },
    {
        id: '2',
        title: 'Nieuwe postzegels 2024 onthuld',
        image: 'https://images.unsplash.com/photo-1591871239535-c089b0d6a782?q=80&w=300&auto=format&fit=crop',
        source: 'PostNL'
    },
    {
        id: '3',
        title: 'Veilingrecord voor Zeldzame Munt',
        image: 'https://images.unsplash.com/photo-1620822649526-f40441e8cce9?q=80&w=300&auto=format&fit=crop',
        source: 'Veilinghuis'
    }
];

interface NewsCarouselProps {
    onMorePress?: () => void;
}

export const NewsCarousel: React.FC<NewsCarouselProps> = ({ onMorePress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Market News</Text>
                <TouchableOpacity onPress={onMorePress}>
                    <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {MOCK_NEWS.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={styles.overlay}>
                            <View style={styles.sourceBadge}>
                                <Text style={styles.sourceText}>{item.source}</Text>
                            </View>
                            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        </View>
                    </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    seeAll: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: 15,
    },
    card: {
        width: 240,
        height: 140,
        borderRadius: 16,
        marginHorizontal: 5,
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 12,
        justifyContent: 'flex-end',
    },
    sourceBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    sourceText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000',
        textTransform: 'uppercase',
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
