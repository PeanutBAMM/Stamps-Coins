import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StatusBar, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { portfolioService } from '../services/portfolioService';
import { PortfolioSummary, AssetPerformance } from '../types/portfolio.types';
import { PortfolioValue } from '../components/dashboard/PortfolioValue';
import { TopMoversWidget } from '../components/dashboard/TopMoversWidget';
import { NewsCarousel } from '../components/dashboard/NewsCarousel';
import { useRealtimePrices } from '../hooks/useRealtimePrices';

const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { session } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [summary, setSummary] = useState<PortfolioSummary>({
        total_value: 0,
        change_24h_value: 0,
        change_24h_percentage: 0
    });
    const [topMovers, setTopMovers] = useState<AssetPerformance[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!session?.user?.id) return;
        try {
            const [stats, movers] = await Promise.all([
                portfolioService.get24hChange(session.user.id),
                portfolioService.getTopMovers(session.user.id)
            ]);
            setSummary(stats);
            setTopMovers(movers);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [session?.user?.id]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    // Subscribe to realtime updates
    useRealtimePrices(session?.user?.id, fetchData);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const handleFabPress = () => {
        navigation.navigate('Scanner'); // Assuming 'Scanner' is the route name
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f2f2f7" />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <PortfolioValue
                    totalValue={summary.total_value}
                    changeValue={summary.change_24h_value}
                    changePercentage={summary.change_24h_percentage}
                    isLoading={isLoading && !refreshing && summary.total_value === 0}
                />

                <TopMoversWidget
                    movers={topMovers}
                    isLoading={isLoading}
                    onItemPress={(id) => navigation.navigate('ItemDetail', { id })}
                />

                <NewsCarousel />

                {/* Simple Spacer for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <Ionicons name="camera" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default DashboardScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', // iOS system gray 6
    },
    scrollContent: {
        paddingBottom: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF', // iOS blue
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
});
