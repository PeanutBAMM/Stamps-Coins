import { itemService } from '../services/itemService';
import { supabase } from '../api/supabase';
import { mockStampMint, mockCoinGold, mockStampCollection } from './fixtures';

// Mock Supabase
jest.mock('../api/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
        })),
    },
}));

describe('itemService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch items by vault', async () => {
        (supabase.from as jest.Mock).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockStampCollection, error: null }),
        }));

        const items = await itemService.getItemsByVault('vault-001');
        expect(items).toHaveLength(3);
        expect(items[0].name).toBe(mockStampMint.name);
        expect(supabase.from).toHaveBeenCalledWith('items');
    });

    it('should get single item by ID', async () => {
        (supabase.from as jest.Mock).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockCoinGold, error: null }),
        }));

        const result = await itemService.getItem(mockCoinGold.id);
        expect(result.name).toBe('Gouden Tientje Willem III');
        expect(result.material).toBe('Gold');
    });

    it('should set manual value', async () => {
        const manualPrice = 500.00;
        const updatedItem = { ...mockCoinGold, manual_price: manualPrice };

        (supabase.from as jest.Mock).mockImplementation(() => ({
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: updatedItem, error: null }),
        }));

        const result = await itemService.setManualValue(mockCoinGold.id, manualPrice);
        expect(result.manual_price).toBe(manualPrice);
    });
});
