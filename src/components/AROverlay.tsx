import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { theme } from '../constants/theme';
import { Scan } from 'lucide-react-native';

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
    return (
        <View style={styles.container} pointerEvents="none">
            <View style={styles.reticle}>
                <View style={[styles.corner, styles.topLeft, isDetecting && styles.activeCorner]} />
                <View style={[styles.corner, styles.topRight, isDetecting && styles.activeCorner]} />
                <View style={[styles.corner, styles.bottomLeft, isDetecting && styles.activeCorner]} />
                <View style={[styles.corner, styles.bottomRight, isDetecting && styles.activeCorner]} />

                {isDetecting && (
                    <View style={styles.scanLine} />
                )}
            </View>

            <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackText}>{feedback}</Text>
            </View>

            {itemCount > 1 && (
                <View style={styles.itemCountBadge}>
                    <Scan size={16} color="#fff" />
                    <Text style={styles.itemCountText}>{itemCount} items gevonden</Text>
                </View>
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
        width: width * 0.75,
        height: width * 0.75,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeCorner: {
        borderColor: theme.colors.primary,
    },
    topLeft: {
        top: -4,
        left: -4,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 16,
    },
    topRight: {
        top: -4,
        right: -4,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 16,
    },
    bottomLeft: {
        bottom: -4,
        left: -4,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 16,
    },
    bottomRight: {
        bottom: -4,
        right: -4,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 16,
    },
    scanLine: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: theme.colors.primary,
        opacity: 0.5,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    feedbackContainer: {
        position: 'absolute',
        bottom: 240,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    feedbackText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    itemCountBadge: {
        position: 'absolute',
        top: 100,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    itemCountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    }
});

export default AROverlay;
