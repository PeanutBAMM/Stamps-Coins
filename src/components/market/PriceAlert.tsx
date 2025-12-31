import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react-native';

interface PriceAlertProps {
    assetName: string;
    changePercentage: number;
    currentPrice: number;
    currency: string;
}

const PriceAlert: React.FC<PriceAlertProps> = ({
    assetName,
    changePercentage,
    currentPrice,
    currency
}) => {
    const isPositive = changePercentage >= 0;
    const isHighImpact = Math.abs(changePercentage) > 5;

    return (
        <LinearGradient
            colors={isPositive ? ['rgba(20, 83, 45, 0.8)', 'rgba(20, 83, 45, 0.4)'] : ['rgba(127, 29, 29, 0.8)', 'rgba(127, 29, 29, 0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.iconContainer}>
                {isHighImpact ? (
                    <AlertTriangle size={24} color="#fff" />
                ) : isPositive ? (
                    <TrendingUp size={24} color="#4ADE80" />
                ) : (
                    <TrendingDown size={24} color="#F87171" />
                )}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.label}>PRIJS ALERT</Text>
                    <Text style={[styles.change, { color: isPositive ? '#4ADE80' : '#F87171' }]}>
                        {isPositive ? '+' : ''}{changePercentage.toFixed(2)}%
                    </Text>
                </View>
                <Text style={styles.message}>
                    <Text style={styles.assetName}>{assetName}</Text> is nu {currency} {currentPrice.toFixed(2)} waard.
                </Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: 'rgba(255, 255, 255, 0.3)',
    },
    iconContainer: {
        marginRight: 12,
        width: 32,
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
        opacity: 0.8,
    },
    change: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    message: {
        color: '#eee',
        fontSize: 13,
    },
    assetName: {
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default PriceAlert;
