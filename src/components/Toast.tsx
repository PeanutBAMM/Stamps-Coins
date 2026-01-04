import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X, CheckCircle, AlertCircle, Info, Loader } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
    message: string;
    type?: ToastType;
    onHide: () => void;
    visible: boolean;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    onHide,
    visible,
    duration = 4000
}) => {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 50,
                    friction: 8,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            if (type !== 'loading') {
                const timer = setTimeout(() => {
                    hideToast();
                }, duration);
                return () => clearTimeout(timer);
            }
        } else {
            hideToast();
        }
    }, [visible, duration, type]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (visible) onHide();
        });
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle color="#4ADE80" size={24} />;
            case 'error':
                return <AlertCircle color="#EF4444" size={24} />;
            case 'loading':
                return <Loader color="#60A5FA" size={24} />;
            default:
                return <Info color="#60A5FA" size={24} />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return '#4ADE80';
            case 'error': return '#EF4444';
            default: return 'rgba(255, 255, 255, 0.2)';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    top: insets.top + 10,
                    opacity,
                    transform: [{ translateY }]
                }
            ]}
        >
            <BlurView intensity={80} tint="dark" style={[styles.blurContainer, { borderColor: getBorderColor() }]}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        {getIcon()}
                    </View>
                    <Text style={styles.message}>{message}</Text>
                    {type !== 'loading' && (
                        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                            <X color="#9CA3AF" size={18} />
                        </TouchableOpacity>
                    )}
                </View>
            </BlurView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    blurContainer: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.4)', // Slate-800 with transparency
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        fontFamily: 'System', // Use default system font or app font if available
    },
    closeButton: {
        padding: 4,
        marginLeft: 8,
    },
});
