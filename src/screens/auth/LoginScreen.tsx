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
import { loginSchema } from '../../utils/validation';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [ghostLoading, setGhostLoading] = useState(false);

    const handleLogin = async () => {
        setErrors({});

        // Validation
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
            const fieldErrors: any = {};
            validation.error.issues.forEach((issue) => {
                if (issue.path[0]) fieldErrors[issue.path[0]] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        setLoading(true);
        try {
            await authService.signIn(email, password);
        } catch (error: any) {
            errorService.handleError(error, 'LoginScreen.handleLogin');
            Alert.alert('Fout', error.message || 'Inloggen mislukt.');
        } finally {
            setLoading(false);
        }
    };

    const handleGhostLogin = async () => {
        setGhostLoading(true);
        try {
            await authService.signInAnonymously();
        } catch (error: any) {
            errorService.handleError(error, 'LoginScreen.handleGhostLogin');
            Alert.alert('Fout', error.message || 'Anoniem inloggen mislukt.');
        } finally {
            setGhostLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welkom terug</Text>
                    <Text style={styles.subtitle}>Log in om je collectie te beheren</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>E-mailadres</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="naam@voorbeeld.nl"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Wachtwoord</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="••••••••"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword', { email })}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Wachtwoord vergeten?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading || ghostLoading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.text} />
                        ) : (
                            <Text style={styles.loginButtonText}>Inloggen</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.ghostButton}
                        onPress={handleGhostLogin}
                        disabled={loading || ghostLoading}
                    >
                        {ghostLoading ? (
                            <ActivityIndicator color={theme.colors.text} />
                        ) : (
                            <Text style={styles.ghostButtonText}>Doorgaan zonder account</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Nog geen account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Onboarding')}>
                        <Text style={styles.linkText}>Registreer hier</Text>
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
        justifyContent: 'center',
    },
    header: {
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: theme.spacing.md,
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
    inputError: {
        borderColor: theme.colors.error,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: theme.spacing.md,
    },
    forgotPasswordText: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
    },
    loginButtonText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    ghostButton: {
        padding: theme.spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    ghostButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        color: theme.colors.textSecondary,
        marginRight: theme.spacing.xs,
    },
    linkText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});
