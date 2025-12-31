/**
 * Integration Test - Scan Flow
 * Tests the complete scanning process from image capture to item creation.
 */

// Mock dependencies BEFORE imports
jest.mock('../../services/cloudinaryService', () => ({
    default: { uploadImage: jest.fn() },
    __esModule: true,
}));

jest.mock('../../api/supabase', () => ({
    supabase: {
        functions: { invoke: jest.fn() },
    },
}));

// Now import aiService (it will use the mocked dependencies)
import { aiService } from '../../services/aiService';
import cloudinaryService from '../../services/cloudinaryService';
import { supabase } from '../../api/supabase';

describe('Scan Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Complete Scan Pipeline', () => {
        it('should successfully process a scan from image to item', async () => {
            // Setup mocks for full flow
            (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue({
                secure_url: 'https://cloudinary.com/test-image.jpg',
            });

            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: {
                    itemId: 'item-123',
                    identification: {
                        type: 'stamp',
                        name: 'Penny Black 1840',
                        confidence: 0.95,
                    },
                },
                error: null,
            });

            const result = await aiService.processScan('file:///test/stamp.jpg');

            expect(result.success).toBe(true);
            expect(result.itemId).toBe('item-123');
            expect(result.identification?.name).toBe('Penny Black 1840');
            expect(cloudinaryService.uploadImage).toHaveBeenCalledWith('file:///test/stamp.jpg');
            expect(supabase.functions.invoke).toHaveBeenCalledWith('process-scan', {
                body: { imageUrl: 'https://cloudinary.com/test-image.jpg' },
            });
        });

        it('should handle Cloudinary upload failure gracefully', async () => {
            (cloudinaryService.uploadImage as jest.Mock).mockRejectedValue(
                new Error('Network error during upload')
            );

            const result = await aiService.processScan('file:///test/stamp.jpg');

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });

        it('should handle Edge Function failure gracefully', async () => {
            (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue({
                secure_url: 'https://cloudinary.com/test.jpg',
            });

            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: 'AI processing failed' },
            });

            const result = await aiService.processScan('file:///test/stamp.jpg');

            expect(result.success).toBe(false);
        });
    });

    describe('Market Price Updates', () => {
        it('should fetch updated market price for an item', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: { price: 250.00, currency: 'EUR', source: 'Catawiki' },
                error: null,
            });

            const result = await aiService.getMarketPrice('item-123');

            expect(result).not.toBeNull();
            expect(result?.price).toBe(250.00);
            expect(supabase.functions.invoke).toHaveBeenCalledWith('get-market-price', {
                body: { itemId: 'item-123' },
            });
        });

        it('should return null on market price fetch failure', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: null,
                error: { message: 'Rate limited' },
            });

            const result = await aiService.getMarketPrice('item-123');

            expect(result).toBeNull();
        });
    });
});
