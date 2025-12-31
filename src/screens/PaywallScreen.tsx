import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { subscriptionService } from '../services/subscriptionService';
import { theme } from '../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

export default function PaywallScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(true);
    const [packages, setPackages] = useState<any[]>([]);
    const [purchasing, setPurchasing] = useState(false);

    useEffect(() => {
        loadOfferings();
    }, []);

    const loadOfferings = async () => {
        try {
            const currentOffering = await subscriptionService.getOfferings();
            if (currentOffering) {
                setPackages(currentOffering.availablePackages);
            }
        } catch (error) {
            console.error('Error loading offerings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (pack: any) => {
        setPurchasing(true);
        try {
            const success = await subscriptionService.purchasePackage(pack);
            if (success) {
                Alert.alert('Hoera!', 'Je bent nu een Pro-lid!');
                navigation.goBack();
            }
        } catch (error: any) {
            if (!error.userCancelled) {
                Alert.alert('Fout', error.message || 'Aankoop mislukt.');
            }
        } finally {
            setPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        try {
            const success = await subscriptionService.restorePurchases();
            if (success) {
                Alert.alert('Hersteld', 'Je Pro-status is hersteld.');
                navigation.goBack();
            } else {
                Alert.alert('Geen aankopen', 'We hebben geen actieve Pro-abonnementen gevonden.');
            }
        } catch (error: any) {
            Alert.alert('Fout', error.message || 'Herstellen mislukt.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Ontgrendel Pro 🚀</Text>
                    <Text style={styles.subtitle}>Haal het maximale uit je collectie met onbeperkte scans en real-time waarde tracking.</Text>
                </View>

                <View style={styles.features}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✨</Text>
                        <View>
                            <Text style={styles.featureTitle}>Onbeperkte Scans</Text>
                            <Text style={styles.featureDesc}>Geen limiet van 35 items meer.</Text>
                        </View>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>📈</Text>
                        <View>
                            <Text style={styles.featureTitle}>Gedetailleerde Grafieken</Text>
                            <Text style={styles.featureDesc}>Zie hoe de waarde van je kluis groeit.</Text>
                        </View>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>🌍</Text>
                        <View>
                            <Text style={styles.featureTitle}>Globale Marktdata</Text>
                            <Text style={styles.featureDesc}>Prijzen uit Europa, NA en Azië.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.packages}>
                    {packages.map((pkg) => (
                        <TouchableOpacity
                            key={pkg.identifier}
                            style={styles.packageCard}
                            onPress={() => handlePurchase(pkg)}
                            disabled={purchasing}
                        >
                            <View>
                                <Text style={styles.packageName}>{pkg.product.title}</Text>
                                <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
                            </View>
                            {purchasing ? <ActivityIndicator color={theme.colors.primary} /> : <Text style={styles.buyText}>Kies</Text>}
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Vorige aankopen herstellen</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.xl,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
    closeIcon: {
        fontSize: 24,
        color: theme.colors.textSecondary,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    features: {
        marginBottom: theme.spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    featureDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    packages: {
        gap: theme.spacing.md,
    },
    packageCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    packageName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    packagePrice: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    buyText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    restoreButton: {
        marginTop: theme.spacing.xl,
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    restoreText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
