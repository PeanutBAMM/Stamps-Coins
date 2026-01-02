import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../constants/theme';
import * as Sentry from '@sentry/react-native';

// Screens
import { MainTabNavigator } from './MainTabNavigator';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VaultDetailScreen from '../screens/VaultDetailScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import ExportScreen from '../screens/ExportScreen';
import PaywallScreen from '../screens/PaywallScreen';

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    ForgotPassword: { email?: string };
    MainTabs: undefined; // The container for Dashboard, Vaults, Scanner, Market, Profile
    VaultDetail: { vaultId: string; vaultName: string };
    ItemDetail: { itemId: string };
    Export: undefined;
    Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = ({ routingInstrumentation }: { routingInstrumentation?: any }) => {
    const navigationRef = React.useRef(null);
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={() => {
                if (routingInstrumentation) {
                    routingInstrumentation.registerNavigationContainer(navigationRef);
                }
            }}
        >
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {!session ? (
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    </>
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                        <Stack.Screen name="VaultDetail" component={VaultDetailScreen} />
                        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                        <Stack.Screen name="Export" component={ExportScreen} />
                        <Stack.Screen name="Paywall" component={PaywallScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
