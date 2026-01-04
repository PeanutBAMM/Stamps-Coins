import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChangeIndicatorProps {
    changePercentage: number;
    changeValue?: number;
    currency?: string;
    showValue?: boolean;
}

export const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
    changePercentage,
    changeValue,
    currency = '€',
    showValue = false
}) => {
    const isPositive = changePercentage >= 0;
    const isNeutral = changePercentage === 0;
    const color = isNeutral ? '#8E8E93' : isPositive ? '#34C759' : '#FF3B30';
    const arrowIcon = isPositive ? 'arrow-up' : 'arrow-down';

    return (
        <View style={[styles.container, { backgroundColor: `${color}20` }]}>
            {!isNeutral && (
                <Ionicons name={arrowIcon} size={12} color={color} style={styles.icon} />
            )}
            <Text style={[styles.text, { color }]}>
                {Math.abs(changePercentage).toFixed(2)}%
            </Text>
            {showValue && changeValue !== undefined && (
                <Text style={[styles.text, { color, marginLeft: 4 }]}>
                    ({changeValue > 0 ? '+' : ''}{currency}{changeValue.toFixed(2)})
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    icon: {
        marginRight: 2,
    },
    text: {
        fontWeight: '600',
        fontSize: 14,
    },
});
