import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { theme } from '../constants/theme';

export const SkeletonCard = () => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.card}>
            <Animated.View style={[styles.image, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.title, { opacity }]} />
                <Animated.View style={[styles.subtitle, { opacity }]} />
                <View style={styles.footer}>
                    <Animated.View style={[styles.badge, { opacity }]} />
                    <Animated.View style={[styles.price, { opacity }]} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.roundness,
        overflow: 'hidden',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    image: {
        height: 180,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    content: {
        padding: theme.spacing.md,
    },
    title: {
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        width: '70%',
        marginBottom: 8,
    },
    subtitle: {
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
        width: '40%',
        marginBottom: theme.spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        height: 24,
        width: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
    },
    price: {
        height: 18,
        width: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 4,
    }
});

export default SkeletonCard;
