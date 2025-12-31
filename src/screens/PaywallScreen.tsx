import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { subscriptionService } from '../../services/subscriptionService';
import { theme } from '../../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>; // Or navigate to Paywall directly

export default function PaywallScreen({ navigation }: any) {
    const [loading, setLoading] = useState(false);

    const handlePresentPaywall = async () => {
        try {
            const result = await RevenueCatUI.presentPaywall();

            switch (result) {
                case PAYWALL_RESULT.PURCHASED:
                    Alert.alert('Succes!', 'Je bent nu een Pro verzamelaar.');
                    navigation.goBack();
                    break;
                case PAYWALL_RESULT.RESTORED:
                    Alert.alert('Hersteld', 'Je aankopen zijn succesvol hersteld.');
                    navigation.goBack();
                    break;
                case PAYWALL_RESULT.CANCELLED:
                case PAYWALL_RESULT.NOT_PRESENTED:
                case PAYWALL_RESULT.ERROR:
                default:
                    break;
            }
        } catch (error) {
            console.error('Paywall error:', error);
            Alert.alert('Fout', 'Er is iets misgegaan bij het tonen van de paywall.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Upgrade naar Pro</Text>
            <Text style={styles.description}>
                Ontgrendel de volledige kracht van Stamps & Coins en beheer je collectie als een professional.
            </Text>

            <View style={styles.features}>
                <Feature text="Onbeperkt items scannen" />
                <Feature text="Historische prijsgrafieken" />
                <Feature text="CSV & PDF exports" />
                <Feature text="Ad-free ervaring" />
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handlePresentPaywall}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={theme.colors.text} />
                ) : (
                    <Text style={styles.buttonText}>Bekijk Pro Opties</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => subscriptionService.restorePurchases()}>
                <Text style={styles.restoreText}>Bestaande aankoop herstellen?</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const Feature = ({ text }: { text: string }) => (
    <View style={styles.featureItem}>
        <Text style={styles.featureBullet}>✓</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    features: {
        width: '100%',
        marginBottom: theme.spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    featureBullet: {
        color: theme.colors.success,
        fontSize: 18,
        marginRight: theme.spacing.sm,
        fontWeight: 'bold',
    },
    featureText: {
        color: theme.colors.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.roundness,
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    restoreText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});
