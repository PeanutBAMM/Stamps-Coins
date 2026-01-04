import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { theme } from '../../constants/theme';
import { authService } from '../../services/authService';
import { errorService } from '../../services/errorService';

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Fout', 'Vul alstublieft je e-mailadres in.');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email);
            Alert.alert(
                'E-mail verzonden',
                'Controleer je inbox voor instructies om je wachtwoord te herstellen.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            errorService.handleError(error, 'ForgotPasswordScreen.handleReset');
            Alert.alert('Fout', error.message || 'Herstellen mislukt.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>← Terug naar Login</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Wachtwoord vergeten?</Text>
                    <Text style={styles.subtitle}>Geen probleem! Vul je e-mailadres in en we sturen je een herstellink.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-mailadres</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="naam@voorbeeld.nl"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Instructies versturen</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: theme.spacing.lg,
    },
    backButton: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    backText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        lineHeight: 22,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: theme.spacing.xs,
        fontWeight: '600',
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: theme.spacing.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
