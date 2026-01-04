import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../constants/theme';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react-native';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

interface ProcessingDockProps {
    status: ProcessingStatus;
    message?: string;
    progress?: number;
}

export const ProcessingDock: React.FC<ProcessingDockProps> = ({
    status,
    message = 'AI is aan het analyseren...',
    progress = 0
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(100)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (status !== 'idle') {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [status]);

    useEffect(() => {
        if (status === 'processing') {
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.stopAnimation();
        }
    }, [status]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (status === 'idle') return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
        >
            <BlurView intensity={80} style={styles.blur} tint="dark">
                <View style={styles.content}>
                    <Animated.View style={status === 'processing' ? { transform: [{ rotate: spin }] } : {}}>
                        {status === 'processing' && <Loader2 color={theme.colors.primary} size={24} />}
                        {status === 'success' && <CheckCircle2 color={theme.colors.success} size={24} />}
                        {status === 'error' && <AlertCircle color={theme.colors.error} size={24} />}
                    </Animated.View>

                    <View style={styles.textContainer}>
                        <Text style={styles.message}>{message}</Text>
                        {status === 'processing' && (
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                            </View>
                        )}
                    </View>
                </View>
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 1000,
    },
    blur: {
        padding: 16,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 12,
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    }
});

export default ProcessingDock;
