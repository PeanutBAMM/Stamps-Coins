import { supabase } from '../api/supabase';
import { Linking, Alert } from 'react-native';

export const exportService = {
    /**
     * Request an export from the backend
     */
    async generateExport(userId: string, format: 'csv' | 'pdf') {
        try {
            const { data, error } = await supabase.functions.invoke('generate-export', {
                body: { user_id: userId, format }
            });

            if (error) throw error;

            if (data?.url) {
                // Open the signed URL in default browser
                const supported = await Linking.canOpenURL(data.url);
                if (supported) {
                    await Linking.openURL(data.url);
                } else {
                    Alert.alert('Fout', 'Kan de download link niet openen.');
                }
            } else {
                throw new Error('Geen download URL ontvangen.');
            }

            return true;
        } catch (error: any) {
            console.error('Export error:', error);
            throw error;
        }
    }
};
