import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={styles.container}>
        <Text style={styles.text}>{name} Screen</Text>
    </View>
);

export const DashboardScreen = () => <PlaceholderScreen name="Dashboard" />;
export const ScannerScreen = () => <PlaceholderScreen name="Scanner" />;
export const VaultsScreen = () => <PlaceholderScreen name="Vaults" />;
export const ItemDetailScreen = () => <PlaceholderScreen name="Item Detail" />;
export const MarketScreen = () => <PlaceholderScreen name="Market" />;
export const ProfileScreen = () => <PlaceholderScreen name="Profile" />;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: theme.colors.text,
        fontSize: 20,
    },
});

export default PlaceholderScreen;
