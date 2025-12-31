import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { profileSchema } from '../utils/validation';

export default function ProfileScreen({ navigation }: any) {
    const { user, isGhost, signOut } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;
        setFetchingProfile(true);
        try {
            const profileData = await profileService.getProfile(user.id);
            if (profileData) {
                setProfile(profileData);
                setUsername(profileData.username || '');
                setFullName(profileData.full_name || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;

        // Validation
        const validation = profileSchema.safeParse({ username, full_name: fullName });
        if (!validation.success) {
            Alert.alert('Fout', validation.error.issues[0].message);
            return;
        }

        setLoading(true);
        try {
            await profileService.updateProfile(user.id, {
                username,
                full_name: fullName,
                updated_at: new Date(),
            });
            await authService.updateMetadata({ username, full_name: fullName });
            Alert.alert('Succes', 'Profiel bijgewerkt!');
        } catch (error: any) {
            Alert.alert('Fout', error.message || 'Bijwerken mislukt.');
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        if (!email || !password) {
            Alert.alert('Fout', 'Vul een e-mail en wachtwoord in om je account veilig te stellen.');
            return;
        }

        setLoading(true);
        try {
            await authService.convertGhostToEmail(email, password);
            Alert.alert('Succes', 'Je account is nu gekoppeld aan je e-mailadres!');
        } catch (error: any) {
            Alert.alert('Fout', error.message || 'Kon account niet koppelen.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            Alert.alert('Fout', 'Uitloggen mislukt.');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Profiel</Text>

            {fetchingProfile ? (
                <ActivityIndicator color={theme.colors.primary} />
            ) : (
                <>
                    <View style={styles.section}>
                        <Text style={styles.label}>Gebruikersnaam</Text>
                        <TextInput
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="Kies een gebruikersnaam"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <Text style={[styles.label, { marginTop: theme.spacing.md }]}>Volledige Naam</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Je naam"
                            placeholderTextColor={theme.colors.textSecondary}
                        />

                        <TouchableOpacity
                            style={[styles.button, { marginTop: theme.spacing.lg }]}
                            onPress={handleUpdateProfile}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Opslaan</Text>}
                        </TouchableOpacity>
                    </View>

                    {isGhost && (
                        <View style={styles.ghostContainer}>
                            <Text style={styles.ghostTitle}>Beveilig je collectie 🔐</Text>
                            <Text style={styles.ghostText}>
                                Je gebruikt momenteel een tijdelijk account. Koppel een e-mailadres om je kluis nooit kwijt te raken.
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="E-mailadres"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />

                            <TextInput
                                style={[styles.input, { marginTop: theme.spacing.sm }]}
                                placeholder="Wachtwoord"
                                placeholderTextColor={theme.colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: theme.colors.primary, marginTop: theme.spacing.md }]}
                                onPress={handleConvert}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>Account Koppelen</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {!isGhost && (
                        <View style={styles.section}>
                            <Text style={styles.label}>Abonnement</Text>
                            <View style={styles.proRow}>
                                <Text style={styles.value}>{profile?.pro_status ? 'Pro Plan ✨' : 'Gratis Versie'}</Text>
                                {!profile?.pro_status && (
                                    <TouchableOpacity style={styles.upgradeLink} onPress={() => navigation.navigate('Paywall')}>
                                        <Text style={styles.upgradeText}>Upgrade</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.label}>Instellingen</Text>
                        <View style={styles.settingItem}>
                            <Text style={styles.settingLabel}>Valuta</Text>
                            <View style={styles.currencyToggle}>
                                {['EUR', 'USD'].map((curr) => (
                                    <TouchableOpacity
                                        key={curr}
                                        style={[styles.toggleBtn, profile?.currency === curr && styles.toggleBtnActive]}
                                        onPress={() => profileService.updateSettings(user.id, { currency: curr }).then(() => loadProfile())}
                                    >
                                        <Text style={[styles.toggleText, profile?.currency === curr && styles.toggleTextActive]}>{curr}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
                            <Text style={styles.settingLabel}>Regio</Text>
                            <Text style={styles.value}>{profile?.region || 'Detecteren...'}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>Data & Export</Text>
                        <TouchableOpacity style={styles.exportBtn} onPress={() => navigation.navigate('Export')}>
                            <Text style={styles.exportBtnText}>Open Export Menu</Text>
                        </TouchableOpacity>

                    </View>

                    {!isGhost && (
                        <View style={styles.section}>
                            <Text style={styles.label}>E-mail</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                        <Text style={styles.signOutText}>Uitloggen</Text>
                    </TouchableOpacity>
                </>
            )
            }
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        padding: theme.spacing.md,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    button: {
        backgroundColor: theme.colors.secondary,
        padding: theme.spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    ghostContainer: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        padding: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: theme.spacing.xl,
    },
    ghostTitle: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: theme.spacing.sm,
    },
    ghostText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: theme.spacing.md,
        lineHeight: 20,
    },
    signOutButton: {
        padding: theme.spacing.md,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    signOutText: {
        color: theme.colors.error,
        fontSize: 16,
        fontWeight: '600',
    },
    proRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    upgradeLink: {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    upgradeText: {
        color: theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    settingLabel: {
        color: theme.colors.text,
        fontSize: 16,
    },
    currencyToggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        padding: 4,
        borderRadius: 10,
    },
    toggleBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: theme.colors.primary,
    },
    toggleText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
    },
    exportRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    exportBtn: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    exportBtnText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
});
