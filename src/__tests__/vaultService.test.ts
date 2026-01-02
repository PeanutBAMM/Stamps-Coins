import { vaultService } from '../services/vaultService';
import { supabase } from '../api/supabase';
import { mockVaultStamps, mockFreeUser, mockUserVaults } from './fixtures';
import { errorService } from '../services/errorService';

jest.mock('../services/errorService', () => ({
    errorService: {
        handleError: jest.fn(),
        addBreadcrumb: jest.fn(),
    },
}));

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
        auth: {
            getUser: jest.fn(),
        },
    },
}));

describe('vaultService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a vault', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: mockFreeUser.id } } });
        (supabase.from as jest.Mock).mockImplementation(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockVaultStamps, error: null }),
        }));

        const result = await vaultService.createVault({ name: mockVaultStamps.name, type: 'Stamps' });
        expect(result).toEqual(mockVaultStamps);
    });

    it('should fail to create vault if not authenticated', async () => {
        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: null } });
        await expect(vaultService.createVault({ name: 'Test', type: 'Stamps' }))
            .rejects.toThrow('User not authenticated');
    });

    it('should fetch user vaults', async () => {
        // Mock vaults with nested items structure that getVaults expects
        const mockVaultsWithItems = mockUserVaults.map(v => ({
            ...v,
            items: [{ count: v.item_count || 0 }],
            items_value: [{ market_price: v.total_value || 0, manual_value: null }],
        }));

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: mockFreeUser.id } } });
        (supabase.from as jest.Mock).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockVaultsWithItems, error: null }),
        }));

        const result = await vaultService.getVaults();
        expect(result).toHaveLength(4);
        expect(result[0].name).toBe(mockVaultStamps.name);
    });
});
