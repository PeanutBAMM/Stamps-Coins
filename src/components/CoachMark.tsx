import React from 'react';
import { StyleSheet, Text, View, Animated, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../constants/theme';

interface CoachMarkProps {
    text: string;
    style?: ViewStyle;
}

export const CoachMark: React.FC<CoachMarkProps> = ({ text, style }) => {
    return (
        <Animated.View style={[styles.container, style]}>
            <BlurView intensity={80} tint="light" style={styles.blur}>
                <Text style={styles.text}>{text}</Text>
            </BlurView>
            <View style={styles.arrow} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'center',
        zIndex: 1000,
    },
    blur: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    text: {
        color: '#1F2937',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    arrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: 'rgba(255, 255, 255, 0.8)',
        marginTop: -1,
    },
});
