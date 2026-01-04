import { supabase } from '../api/supabase';
import { ProcessScanResponse, MarketPriceResult } from '../types/ai.types';
import cloudinaryService from './cloudinaryService';
import errorService from './errorService';

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
                errorService.handleError(error as Error, 'aiService.processScan.edgeFunction');

                // Try to get the response context
                const errorAny = error as any;
                if (errorAny.context && typeof errorAny.context.json === 'function') {
                    try {
                        const jsonBody = await errorAny.context.json();
                        console.error('Edge Function Response Body:', JSON.stringify(jsonBody));
                    } catch (e) {
                        console.error('Could not extract response body');
                    }
                }

                throw error;
            }

            return {
                success: true,
                itemId: data.itemId,
                identification: data.identification,
            };
        } catch (error: any) {
            errorService.handleError(error instanceof Error ? error : new Error(String(error)), 'aiService.processScan.catch');
            return {
                success: false,
                error: error,
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
            errorService.handleError(error instanceof Error ? error : new Error(String(error)), 'aiService.getMarketPrice');
            return null;
        }
    }
};

export default aiService;
