import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    SafeAreaView,
    FlatList,
    Image,
    Animated
} from 'react-native';
import { theme } from '../../constants/theme';
import { authService } from '../../services/authService';
import { CoachMark } from '../../components/CoachMark';

const { width, height } = Dimensions.get('window');

const ONBOARDING_PAGES = [
    {
        id: '1',
        title: 'Uw Cockpit',
        description: 'Direct inzicht in de totale waarde en dagelijkse veranderingen van uw collectie.',
        subtitle: 'Portfolio waarde: €12.450,80',
        icon: '📊',
        coachMark: 'Dit is je cockpit',
        color: '#6366F1'
    },
    {
        id: '2',
        title: 'Digitale Kluizen',
        description: 'Organiseer uw bezit in gespecificeerde kluizen zoals "Zilveren Munten" of "Zomerzegels".',
        subtitle: 'Kluis: Verzameling Nederland',
        icon: '🔐',
        coachMark: 'Organiseer je bezit',
        color: '#8B5CF6'
    },
    {
        id: '3',
        title: 'Diepe Duik',
        description: 'AI-gedreven extractie van technische gegevens en historische prijsgrafieken voor elk object.',
        subtitle: 'Item: Gouden Tientje 1892',
        icon: '🔍',
        coachMark: 'Diepe duik in elk object',
        color: '#EC4899'
    },
    {
        id: '4',
        title: 'Marktinzichten',
        description: 'Blijf op de hoogte met real-time nieuws en AI-gecureerde marktupdates.',
        subtitle: 'Trend: Bullish (+5.2%)',
        icon: '📈',
        coachMark: 'Blijf op de hoogte',
        color: '#10B981'
    },
    {
        id: '5',
        title: 'Privacy-First',
        description: 'Uw privacy is onze prioriteit. Geen GPS-data en volledig anoniem tot ú kiest voor cloud-sync.',
        subtitle: 'Data Scrubbing Active 🛡️',
        icon: '🛡️',
        coachMark: 'Jouw privacy is prioriteit',
        color: '#F59E0B'
    }
];

export default function OnboardingScreen({ navigation }: any) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems[0]) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const handleNext = () => {
        if (currentIndex < ONBOARDING_PAGES.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.navigate('Login');
        }
    };

    const handleSkip = async () => {
        try {
            await authService.signInAnonymously();
        } catch (error) {
            console.error('Ghost login error on skip:', error);
            navigation.navigate('Login');
        }
    };

    const renderItem = ({ item }: { item: typeof ONBOARDING_PAGES[0] }) => {
        return (
            <View style={[styles.slide, { width }]}>
                <View style={styles.imageContainer}>
                    <View style={[styles.mockup, { backgroundColor: item.color + '20', borderColor: item.color }]}>
                        <Text style={styles.mockupIcon}>{item.icon}</Text>
                        <View style={styles.mockupContent}>
                            <Text style={[styles.mockupText, { color: item.color }]}>{item.subtitle}</Text>
                        </View>
                    </View>
                    <CoachMark
                        text={item.coachMark}
                        style={{ bottom: 10 }}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <Text style={styles.skipText}>Overslaan</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={ONBOARDING_PAGES}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                    useNativeDriver: false,
                })}
                onViewableItemsChanged={viewableItemsChanged}
                viewabilityConfig={viewConfig}
                ref={slidesRef}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {ONBOARDING_PAGES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 20, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View
                                key={i.toString()}
                                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: ONBOARDING_PAGES[i].color }]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: ONBOARDING_PAGES[currentIndex].color }]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === ONBOARDING_PAGES.length - 1 ? 'Starten' : 'Volgende'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        alignItems: 'flex-end',
    },
    skipButton: {
        padding: theme.spacing.sm,
    },
    skipText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    slide: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    imageContainer: {
        flex: 0.6,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    mockup: {
        width: width * 0.7,
        height: height * 0.35,
        borderRadius: 30,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    mockupIcon: {
        fontSize: 80,
        marginBottom: theme.spacing.md,
    },
    mockupContent: {
        alignItems: 'center',
    },
    mockupText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    coachMark: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    coachMarkText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 0.4,
        alignItems: 'center',
        paddingTop: theme.spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },
    pagination: {
        flexDirection: 'row',
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
    },
    button: {
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
