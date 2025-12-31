import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ChangeIndicator } from './ChangeIndicator';

interface PortfolioValueProps {
    totalValue: number;
    changeValue: number;
    changePercentage: number;
    isLoading?: boolean;
    currency?: string;
}

export const PortfolioValue: React.FC<PortfolioValueProps> = ({
    totalValue,
    changeValue,
    changePercentage,
    isLoading = false,
    currency = '€'
}) => {
    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    const formattedValue = new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: currency === '€' ? 'EUR' : 'USD',
        currencyDisplay: 'symbol',
    }).format(totalValue);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Totale Waarde</Text>
            <Text style={styles.value}>{formattedValue}</Text>
            <View style={styles.changeContainer}>
                <ChangeIndicator
                    changePercentage={changePercentage}
                    changeValue={changeValue}
                    currency={currency}
                    showValue={true}
                />
                <Text style={styles.periodLabel}>afgelopen 24u</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    label: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    value: {
        fontSize: 36,
        fontWeight: '800', // Heavy bold
        color: '#000000',
        marginBottom: 8,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    periodLabel: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 8,
    },
});
