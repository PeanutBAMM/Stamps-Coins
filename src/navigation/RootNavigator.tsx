import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens (placeholders)
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import VaultsScreen from '../screens/VaultsScreen';
import ItemDetailScreen from '../screens/ItemDetailScreen';
import MarketScreen from '../screens/MarketScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import PaywallScreen from '../screens/PaywallScreen';

export type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    Dashboard: undefined;
    Scanner: undefined;
    Vaults: undefined;
    VaultDetail: { vaultId: string; vaultName: string };
    ItemDetail: { itemId: string };
    Market: undefined;
    Profile: undefined;
    Paywall: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Onboarding"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="Scanner" component={ScannerScreen} />
                <Stack.Screen name="Vaults" component={VaultsScreen} />
                <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
                <Stack.Screen name="Market" component={MarketScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Paywall" component={PaywallScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
