import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
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
import { profileService } from '../services/profileService';
import { errorService } from '../services/errorService';
import { RootStackParamList } from '../navigation/RootNavigator';

type ScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('back');
    const [flash, setFlash] = useState<FlashMode>('off');
    const [status, setStatus] = useState<ProcessingStatus>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [lastPhoto, setLastPhoto] = useState<string | null>(null);
    const [itemCount, setItemCount] = useState(0);
    const cameraRef = useRef<CameraView>(null);
    const navigation = useNavigation<ScannerScreenNavigationProp>();
    const { user } = useAuth();
    const { isPro } = useProStatus();

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
            setStatus('processing');
            setStatusMessage('Foto maken...');

            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
                skipProcessing: true,
            });

            if (photo) {
                setLastPhoto(photo.uri);
                setStatusMessage('Analyseren...');
                const result = await imageService.processPhoto(photo.uri);

                if (result) {
                    setStatus('success');
                    setStatusMessage('Herkenning voltooid!');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setTimeout(() => setStatus('idle'), 1500);
                    setItemCount(prev => prev + 1);
                } else {
                    throw new Error('Geen resultaat');
                }
            }
        } catch (error: any) {
            errorService.handleError(error, 'ScannerScreen.handleCapture');
            console.error('Capture error:', error);
            setStatus('error');
            setStatusMessage('Fout bij maken foto');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setTimeout(() => setStatus('idle'), 2000);
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
                    <MaterialIcons name={flash === 'on' ? 'flash-on' : 'flash-off'} size={24} color={flash === 'on' ? theme.colors.warning : '#fff'} />
                </TouchableOpacity>
            </View>

            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing} flash={flash}>
                    <AROverlay isDetecting={!isLocked} itemCount={itemCount} />
                </CameraView>
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

            <ProcessingDock status={status} message={statusMessage} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, padding: 20 },
    message: { textAlign: 'center', color: theme.colors.text, fontSize: 16, marginBottom: 20 },
    permissionButton: { backgroundColor: theme.colors.primary, padding: 15, borderRadius: 8 },
    permissionButtonText: { color: '#fff', fontWeight: 'bold' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, position: 'absolute', top: 40, left: 0, right: 0, zIndex: 10 },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    cameraContainer: { flex: 1 },
    camera: { flex: 1 },
    controls: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 30 },
    captureOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center' },
    captureInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff' },
    disabledButton: { opacity: 0.5 },
    thumbnailButton: { width: 50, height: 50, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
    thumbnail: { width: '100%', height: '100%' },
});
