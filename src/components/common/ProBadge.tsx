import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const ProBadge = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>PRO</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 10,
        letterSpacing: 1,
    },
});
