import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StatusBar, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { portfolioService } from '../services/portfolioService';
import { PortfolioSummary, AssetPerformance } from '../types/portfolio.types';
import { PortfolioValue } from '../components/dashboard/PortfolioValue';
import { TopMoversWidget } from '../components/dashboard/TopMoversWidget';
import { NewsCarousel } from '../components/dashboard/NewsCarousel';
import { CoachMark } from '../components/CoachMark';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const [showCTAPopup, setShowCTAPopup] = useState(false);

    useEffect(() => {
        const checkFirstVisit = async () => {
            const hasVisited = await AsyncStorage.getItem('hasVisitedDashboardCTA');
            if (!hasVisited) {
                setIsFirstVisit(true);
                // Delay showing the CTA popup
                setTimeout(() => setShowCTAPopup(true), 1500);
                await AsyncStorage.setItem('hasVisitedDashboardCTA', 'true');
            }
        };
        checkFirstVisit();
    }, []);

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
                <View style={styles.section}>
                    <PortfolioValue
                        totalValue={isFirstVisit && summary.total_value === 0 ? 12450.80 : summary.total_value}
                        changeValue={isFirstVisit && summary.total_value === 0 ? 540.20 : summary.change_24h_value}
                        changePercentage={isFirstVisit && summary.total_value === 0 ? 4.5 : summary.change_24h_percentage}
                        isLoading={isLoading && !refreshing && summary.total_value === 0}
                    />
                    {isFirstVisit && (
                        <CoachMark
                            text="Dit is je cockpit"
                            style={{ top: '60%', alignSelf: 'center' }}
                        />
                    )}
                </View>

                <TopMoversWidget
                    movers={topMovers}
                    isLoading={isLoading}
                    onItemPress={(id) => navigation.navigate('ItemDetail', { id })}
                />

                <NewsCarousel onMorePress={() => navigation.navigate('Market')} />

                {/* Simple Spacer for FAB */}
                <View style={{ height: 80 }} />
            </ScrollView>

            <TouchableOpacity style={styles.fab} onPress={handleFabPress}>
                <Ionicons name="camera" size={28} color="#fff" />
            </TouchableOpacity>

            {showCTAPopup && (
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.ctaContent}
                        onPress={() => {
                            setShowCTAPopup(false);
                            handleFabPress();
                        }}
                    >
                        <Text style={styles.ctaText}>Scan je eerste item</Text>
                        <TouchableOpacity style={styles.ctaClose} onPress={() => setShowCTAPopup(false)}>
                            <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                    <View style={styles.ctaArrow} />
                </View>
            )}
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
    section: {
        position: 'relative',
        width: '100%',
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
    ctaContainer: {
        position: 'absolute',
        bottom: 90,
        right: 24,
        alignItems: 'flex-end',
    },
    ctaContent: {
        backgroundColor: '#007AFF', // Match FAB
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ctaText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    ctaClose: {
        padding: 2,
    },
    ctaArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#007AFF',
        marginRight: 18, // Center with FAB
    },
});
