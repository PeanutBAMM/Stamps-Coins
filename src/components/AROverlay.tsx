import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { Scan } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface AROverlayProps {
    isDetecting?: boolean;
    itemCount?: number;
    feedback?: string;
}

export const AROverlay: React.FC<AROverlayProps> = ({
    isDetecting = true,
    itemCount = 1,
    feedback = 'Houd stil voor beste resultaat...'
}) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isDetecting) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isDetecting]);

    return (
        <View style={styles.container} pointerEvents="none">
            <View style={styles.reticle}>
                <Animated.View style={[
                    styles.corner,
                    styles.topLeft,
                    isDetecting && styles.activeCorner,
                    isDetecting && { transform: [{ scale: pulseAnim }] }
                ]} />
                <Animated.View style={[
                    styles.corner,
                    styles.topRight,
                    isDetecting && styles.activeCorner,
                    isDetecting && { transform: [{ scale: pulseAnim }] }
                ]} />
                <Animated.View style={[
                    styles.corner,
                    styles.bottomLeft,
                    isDetecting && styles.activeCorner,
                    isDetecting && { transform: [{ scale: pulseAnim }] }
                ]} />
                <Animated.View style={[
                    styles.corner,
                    styles.bottomRight,
                    isDetecting && styles.activeCorner,
                    isDetecting && { transform: [{ scale: pulseAnim }] }
                ]} />

                {isDetecting && (
                    <View style={styles.scanLine} />
                )}
            </View>

            <BlurView intensity={20} tint="dark" style={styles.feedbackContainer}>
                <View style={styles.feedbackDot} />
                <Text style={styles.feedbackText}>{feedback.toUpperCase()}</Text>
            </BlurView>

            {itemCount > 1 && (
                <BlurView intensity={30} tint="dark" style={styles.itemCountBadge}>
                    <Scan size={14} color={theme.colors.primary} />
                    <Text style={styles.itemCountText}>{itemCount} ASSETS DETECTED</Text>
                </BlurView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reticle: {
        width: width * 0.7,
        height: width * 0.7,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    activeCorner: {
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderTopLeftRadius: 12,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
        borderTopRightRadius: 12,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderBottomLeftRadius: 12,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderBottomRightRadius: 12,
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: theme.colors.primary,
        opacity: 0.8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
    },
    feedbackContainer: {
        position: 'absolute',
        bottom: 120,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.4)',
        overflow: 'hidden',
    },
    feedbackDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: theme.colors.primary,
        marginRight: 10,
    },
    feedbackText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        fontFamily: 'System', // Bloomberg uses clean sans-serif for data
    },
    itemCountBadge: {
        position: 'absolute',
        top: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.4)',
        overflow: 'hidden',
    },
    itemCountText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginLeft: 8,
    }
});

export default AROverlay;
