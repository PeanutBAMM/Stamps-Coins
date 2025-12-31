import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter } from 'lucide-react-native';
import NewsCard from '../components/market/NewsCard';
import PriceAlert from '../components/market/PriceAlert';
import { supabase } from '../api/supabase'; // Assuming this exists per guide
import { BlurView } from 'expo-blur';

// Mock data integration until Supabase/Edge Function is live
const MOCK_NEWS = [
    {
        id: '1',
        title: 'Zeldzame "Gouden Tientje" geveild voor recordbedrag',
        summary: 'Een perfect bewaard gebleven exemplaar uit 1892 heeft gisteren €15.000 opgebracht bij een veiling in Amsterdam.',
        source: 'MuntKoerier',
        published_at: new Date().toISOString(),
        category: 'coin',
        image_url: 'https://images.unsplash.com/photo-1518550687729-011c7936a29b?auto=format&fit=crop&q=80&w=800',
        source_url: 'https://example.com'
    },
    {
        id: 'alert-1',
        type: 'alert',
        assetName: 'Penny Black',
        changePercentage: 12.5,
        currentPrice: 450.00,
        currency: 'EUR'
    },
    {
        id: '2',
        title: 'PostNL lanceert nieuwe serie natuurzegels',
        summary: 'De nieuwe collectie richt zich op de Nederlandse biodiversiteit en bevat 10 unieke ontwerpen.',
        source: 'Postzegelblog',
        published_at: new Date(Date.now() - 86400000).toISOString(),
        category: 'stamp',
        image_url: 'https://images.unsplash.com/photo-1583095117944-672efd02e600?auto=format&fit=crop&q=80&w=800',
        source_url: 'https://example.com'
    },
    {
        id: '3',
        title: 'Goudprijs tikt nieuwe hoogste stand aan',
        summary: 'Door wereldwijde onzekerheid vluchten beleggers naar edelmetalen, wat de prijs van gouden munten opdrijft.',
        source: 'Finad',
        published_at: new Date(Date.now() - 172800000).toISOString(),
        category: 'general',
        image_url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800',
        source_url: 'https://example.com'
    }
];

const CATEGORIES = ['All', 'Coin', 'Stamp'];

const MarketScreen: React.FC = () => {
    const [news, setNews] = useState<any[]>(MOCK_NEWS);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchNews = async () => {
        setLoading(true);
        // TODO: Integrating Supabase here when Edge Function Works
        // const { data, error } = await supabase.from('news_feed').select('*').order('published_at', { ascending: false });
        // if (data) setNews(data);

        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
        }, 1500);
    };

    const filteredNews = selectedCategory === 'All'
        ? news
        : news.filter(item => item.category === selectedCategory.toLowerCase() || item.type === 'alert');

    const renderItem = ({ item }: { item: any }) => {
        if (item.type === 'alert') {
            return (
                <PriceAlert
                    assetName={item.assetName}
                    changePercentage={item.changePercentage}
                    currentPrice={item.currentPrice}
                    currency={item.currency}
                />
            );
        }

        return (
            <NewsCard
                title={item.title}
                summary={item.summary}
                source={item.source || item.source_name}
                category={item.category}
                publishedAt={item.published_at}
                imageUrl={item.image_url}
                sourceUrl={item.source_url}
            />
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#121212', '#1E1E2E']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Market Insights</Text>
                    <TouchableOpacity style={styles.iconButton}>
                        <Search color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterContainer}>
                    <FlatList
                        horizontal
                        data={CATEGORIES}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterChip,
                                    selectedCategory === item && styles.activeFilterChip
                                ]}
                                onPress={() => setSelectedCategory(item)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    selectedCategory === item && styles.activeFilterText
                                ]}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item}
                    />
                </View>

                <FlatList
                    data={filteredNews}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={fetchNews} tintColor="#fff" />
                    }
                />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 0.5,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    filterChip: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeFilterChip: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    filterText: {
        color: '#999',
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#000',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
});

export default MarketScreen;
