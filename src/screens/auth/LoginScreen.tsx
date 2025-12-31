import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <Text style={styles.buttonText}>Ghost Login (Doorgaan)</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
    },
    button: {
        backgroundColor: theme.colors.surface,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.roundness,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    buttonText: {
        color: theme.colors.text,
        fontSize: 16,
    },
});
