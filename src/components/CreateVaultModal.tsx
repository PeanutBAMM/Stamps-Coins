import React, { useState } from 'react';
import { StyleSheet, View, Text, Modal, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../constants/theme';
import { CreateVaultDTO, VaultType } from '../types/vault.types';
import { X } from 'lucide-react-native';

interface CreateVaultModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: CreateVaultDTO) => Promise<void>;
}

export default function CreateVaultModal({ visible, onClose, onSubmit }: CreateVaultModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<VaultType>('Mixed');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onSubmit({ name, description, type });
            // Reset form
            setName('');
            setDescription('');
            setType('Mixed');
            onClose();
        } catch (error) {
            console.error(error);
            // Ideally show toast/alert here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Nieuwe Kluis</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <X color={theme.colors.text} size={24} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Naam</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Bijv. Mijn Postzegels"
                                placeholderTextColor={theme.colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Type</Text>
                            <View style={styles.typeSelector}>
                                {(['Stamps', 'Coins', 'Mixed'] as VaultType[]).map((t) => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[
                                            styles.typeOption,
                                            type === t && styles.typeOptionSelected
                                        ]}
                                        onPress={() => setType(t)}
                                    >
                                        <Text style={[
                                            styles.typeText,
                                            type === t && styles.typeTextSelected
                                        ]}>
                                            {t === 'Stamps' ? 'Postzegels' : t === 'Coins' ? 'Munten' : 'Gemengd'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Beschrijving (Optioneel)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Korte beschrijving..."
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, (!name.trim() || loading) && styles.disabledButton]}
                            onPress={handleSubmit}
                            disabled={!name.trim() || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Aanmaken</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.xl,
        minHeight: '60%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    form: {
        gap: theme.spacing.lg,
    },
    inputGroup: {
        gap: theme.spacing.sm,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        padding: theme.spacing.md,
        color: theme.colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    typeSelector: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    typeOption: {
        flex: 1,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    typeOptionSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    typeText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    typeTextSelected: {
        color: '#fff',
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
