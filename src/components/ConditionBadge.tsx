import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { ItemCondition } from '../types/item.types';

interface ConditionBadgeProps {
    condition: ItemCondition;
    confidence?: number;
}

export default function ConditionBadge({ condition, confidence }: ConditionBadgeProps) {
    const getColor = (c: ItemCondition) => {
        switch (c) {
            case 'Mint': return '#4CAF50';
            case 'Excellent': return '#8BC34A';
            case 'Good': return '#FFC107';
            case 'Fair': return '#FF9800';
            case 'Poor': return '#F44336';
            default: return theme.colors.textSecondary;
        }
    };

    const color = getColor(condition);

    return (
        <View style={[styles.container, { borderColor: color }]}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={[styles.text, { color }]}>{condition}</Text>
            {confidence && confidence < 0.8 && (
                <Text style={styles.confidence}> ({(confidence * 100).toFixed(0)}%)</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    text: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    confidence: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginLeft: 4,
    }
});
