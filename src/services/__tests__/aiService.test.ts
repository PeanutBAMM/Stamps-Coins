import { aiService } from '../aiService';
import { supabase } from '../../api/supabase';
import cloudinaryService from '../cloudinaryService';

jest.mock('../../api/supabase', () => ({
    supabase: {
        functions: {
            invoke: jest.fn(),
        },
    },
}));

jest.mock('../cloudinaryService', () => ({
    uploadImage: jest.fn(),
}));

describe('aiService', () => {
    const mockUri = 'file:///test/image.jpg';
    const mockCloudinaryUrl = 'https://cloudinary.com/test.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('processScan', () => {
        it('should upload image and call process-scan edge function', async () => {
            (cloudinaryService.uploadImage as jest.Mock).mockResolvedValue({ secure_url: mockCloudinaryUrl });
            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: { itemId: 'item-123', identification: { name: 'Test Stamp' } },
                error: null,
            });

            const result = await aiService.processScan(mockUri);

            expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(mockUri);
            expect(supabase.functions.invoke).toHaveBeenCalledWith('process-scan', {
                body: { imageUrl: mockCloudinaryUrl },
            });
            expect(result.success).toBe(true);
            expect(result.itemId).toBe('item-123');
        });

        it('should handle errors in the scan process', async () => {
            (cloudinaryService.uploadImage as jest.Mock).mockRejectedValue(new Error('Upload error'));

            const result = await aiService.processScan(mockUri);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Upload error');
        });
    });

    describe('getMarketPrice', () => {
        it('should call get-market-price edge function', async () => {
            (supabase.functions.invoke as jest.Mock).mockResolvedValue({
                data: { price: 100, currency: 'EUR' },
                error: null,
            });

            const result = await aiService.getMarketPrice('item-123');

            expect(supabase.functions.invoke).toHaveBeenCalledWith('get-market-price', {
                body: { itemId: 'item-123' },
            });
            expect(result?.price).toBe(100);
        });
    });
});
