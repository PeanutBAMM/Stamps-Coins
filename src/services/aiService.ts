import { supabase } from '../api/supabase';
import { ProcessScanResponse, MarketPriceResult } from '../types/ai.types';
import cloudinaryService from './cloudinaryService';

export const aiService = {
    /**
     * Uploads an image and triggers the AI identification process.
     */
    processScan: async (imageUri: string): Promise<ProcessScanResponse> => {
        try {
            console.log('AI Service: Starting scan process for', imageUri);

            // 1. Upload to Cloudinary
            const uploadResult = await cloudinaryService.uploadImage(imageUri);
            const imageUrl = uploadResult.secure_url;

            // 2. Call Supabase Edge Function 'process-scan'
            console.log('AI Service: Triggering process-scan edge function...');
            const { data, error } = await supabase.functions.invoke('process-scan', {
                body: { imageUrl },
            });

            if (error) {
                console.error('Edge Function error:', error);
                throw error;
            }

            return {
                success: true,
                itemId: data.itemId,
                identification: data.identification,
            };
        } catch (error: any) {
            console.error('AI Service processScan failed:', error);
            return {
                success: false,
                error: error.message || 'Onbekende fout tijdens het scannen',
            };
        }
    },

    /**
     * Gets updated market price for an item.
     */
    getMarketPrice: async (itemId: string): Promise<MarketPriceResult | null> => {
        try {
            const { data, error } = await supabase.functions.invoke('get-market-price', {
                body: { itemId },
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('AI Service getMarketPrice failed:', error);
            return null;
        }
    }
};

export default aiService;
