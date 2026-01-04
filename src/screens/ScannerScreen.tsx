import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, CameraType, FlashMode } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { AROverlay } from '../components/AROverlay';
import { ProcessingDock, ProcessingStatus } from '../components/ProcessingDock';
import { useAuth } from '../hooks/useAuth';
import { useProStatus } from '../hooks/useProStatus';
import { imageService } from '../services/imageService';
import { aiService } from '../services/aiService';
import { profileService } from '../services/profileService';
import { errorService } from '../services/errorService';
import { RootStackParamList, MainTabParamList } from '../navigation/RootNavigator'; // Import MainTabParamList
import { useToast } from '../context/ToastContext';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';

type ScannerScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, 'Scanner'>,
    NativeStackNavigationProp<RootStackParamList>
>;

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [status, setStatus] = useState<ProcessingStatus>('idle'); // Kept for local UI state if needed, though mostly toast driven now
    const [statusMessage, setStatusMessage] = useState('');
    const [lastPhoto, setLastPhoto] = useState<string | null>(null);
    const [itemCount, setItemCount] = useState(0);
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<ScannerScreenNavigationProp>();
    const { user } = useAuth();
    const { isPro } = useProStatus();
    const { showToast } = useToast();

    useEffect(() => {
        if (user) {
            loadItemCount();
        }
    }, [user]);

    const loadItemCount = async () => {
        if (user) {
            const count = await profileService.getItemCount(user.id);
            setItemCount(count);
        }
    };

    const handleCapture = async () => {
        if (!cameraRef.current || status === 'processing') return;

        if (!isPro && itemCount >= 35) {
            Alert.alert(
                'Limiet bereikt',
                'Je hebt de gratis limiet van 35 items bereikt. Upgrade naar Pro.',
                [
                    { text: 'Later', style: 'cancel' },
                    { text: 'Upgrade', onPress: () => navigation.navigate('Paywall') }
                ]
            );
            return;
        }

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            // 1. Take Picture
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: true,
            });

            if (photo) {
                // 2. Process Photo (Resize/Copy) safely BEFORE navigating back
                // This prevents race conditions where CameraView might clean up temp files on unmount
                const processedUri = await imageService.processPhoto(photo.uri);

                // 3. Fire and Forget!
                // Navigate back immediately
                navigation.goBack();

                // Show immediate feedback to user
                showToast('Foto wordt verwerkt...', 'loading');

                // 4. AI Process in Background
                processInBackground(processedUri);
            }
        } catch (error: any) {
            errorService.handleError(error, 'ScannerScreen.handleCapture');
            console.error('Capture error:', error);
            showToast('Fout bij maken foto', 'error');
        }
    };

    const processInBackground = async (uri: string) => {
        try {
            console.log('Background processing started for:', uri);

            // B. AI Identification (Upload + Identify)
            const result = await aiService.processScan(uri);

            if (result.success && result.identification) {
                // Success!
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                console.log('Scan success:', result.identification.name);
                showToast(`Succes! ${result.identification.name} aangemaakt.`, 'success');

                // Note: No need to setItemCount here as screen is unmounted
            } else {
                // Pass the full error object if available, otherwise create a new Error
                const errorToThrow = result.error instanceof Error ? result.error : new Error(result.error as any || 'Herkenning mislukt');
                throw errorToThrow;
            }

        } catch (error: any) {
            console.error('Background processing failed:', error);
            errorService.handleError(error, 'ScannerScreen.processInBackground');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            showToast('Niet herkend. Probeer opnieuw.', 'error');
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const toggleFlash = () => {
        setFlash(current => (current === 'off' ? 'on' : 'off'));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <Text style={styles.message}>We hebben toegang nodig tot je camera.</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Toegang geven</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const isLocked = status === 'processing';

    return (
        <View style={styles.container}>
            {/* Camera View as Background */}
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} flash={flash} />

            {/* Overlay Layers - Absolutely Positioned */}
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
                <SafeAreaView style={styles.uiContainer} pointerEvents="box-none">

                    <View style={styles.header}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="close" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                            <MaterialIcons name={flash === 'on' ? 'flash-on' : 'flash-off'} size={24} color={flash === 'on' ? theme.colors.warning : '#fff'} />
                        </TouchableOpacity>
                    </View>

                    {/* AR Overlay - Sibling to CameraView now, properly positioned */}
                    <View style={styles.overlayContainer} pointerEvents="none">
                        <AROverlay isDetecting={!isLocked} itemCount={itemCount} />
                    </View>

                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.thumbnailButton} disabled={true}>
                            {lastPhoto && <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />}
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.captureOuter, isLocked && styles.disabledButton]} onPress={handleCapture} disabled={isLocked}>
                            <View style={styles.captureInner} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
                            <MaterialIcons name="flip-camera-ios" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Optional: Keep ProcessingDock if we want visible feedback before navigation, likely unused in Fire-n-Forget but good to keep code for now */}
                    {/* <ProcessingDock status={status} message={statusMessage} /> */}

                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    uiContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    message: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: theme.colors.primary,
        padding: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    captureOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
    },
    disabledButton: {
        opacity: 0.5,
    },
    thumbnailButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
    },
});
