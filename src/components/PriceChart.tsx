import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../constants/theme';

type TimeRange = '7d' | '1m' | '1y';

interface PricePoint {
    date: string;
    price: number;
}

interface PriceChartProps {
    data: PricePoint[];
}

export default function PriceChart({ data }: PriceChartProps) {
    const [range, setRange] = useState<TimeRange>('1m');
    const [width, setWidth] = useState(0);
    const height = 180;

    // Filter data based on range (Mock logic for now as we just take all data)
    // In real app, we would slice the array or fetch different data
    const chartData = data;

    if (chartData.length === 0 || width === 0) {
        return (
            <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
                <Text style={{ color: theme.colors.textSecondary }}>Geen prijsdata beschikbaar</Text>
            </View>
        )
    }

    // Calculate scaling
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const minPrice = Math.min(...chartData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1;

    const getX = (index: number) => (index / (chartData.length - 1)) * width;
    const getY = (price: number) => height - ((price - minPrice) / priceRange) * (height - 40) - 20;

    // Generate Path
    let pathD = `M ${getX(0)} ${getY(chartData[0].price)}`;
    chartData.forEach((point, index) => {
        pathD += ` L ${getX(index)} ${getY(point.price)}`;
    });

    return (
        <View style={styles.container} onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
            <View style={styles.header}>
                <Text style={styles.title}>Prijsverloop</Text>
                <View style={styles.toggles}>
                    {(['7d', '1m', '1y'] as TimeRange[]).map(r => (
                        <TouchableOpacity
                            key={r}
                            style={[styles.toggle, range === r && styles.toggleActive]}
                            onPress={() => setRange(r)}
                        >
                            <Text style={[styles.toggleText, range === r && styles.toggleTextActive]}>{r.toUpperCase()}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.chartContainer}>
                <Svg width={width} height={height}>
                    <Defs>
                        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={theme.colors.secondary} stopOpacity="1" />
                            <Stop offset="1" stopColor={theme.colors.secondary} stopOpacity="0.2" />
                        </LinearGradient>
                    </Defs>
                    {/* Grid lines (optional) */}
                    <Line x1="0" y1={getY(minPrice)} x2={width} y2={getY(minPrice)} stroke={theme.colors.border} strokeDasharray="5, 5" />
                    <Line x1="0" y1={getY(maxPrice)} x2={width} y2={getY(maxPrice)} stroke={theme.colors.border} strokeDasharray="5, 5" />

                    <Path
                        d={pathD}
                        stroke={theme.colors.secondary}
                        strokeWidth={3}
                        fill="none"
                    />
                </Svg>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: theme.spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    toggles: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 2,
    },
    toggle: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
    },
    toggleActive: {
        backgroundColor: theme.colors.background,
    },
    toggleText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    toggleTextActive: {
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    chartContainer: {
        height: 180,
        justifyContent: 'center',
    }
});
