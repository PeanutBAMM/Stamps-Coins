import { portfolioService } from '../services/portfolioService';
import { supabase } from '../api/supabase';
import { mockProUser } from './fixtures/users';

// Mock Supabase
jest.mock('../api/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn(),
            insert: jest.fn().mockReturnThis(),
        })),
    },
}));

describe('portfolioService', () => {
    const mockUserId = mockProUser.id;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTotalValue', () => {
        it('should calculate total value correctly', async () => {
            const mockItems = [
                { market_price: 100, manual_value: null },
                { market_price: 50, manual_value: 75 }, // Manual overrides market
                { market_price: null, manual_value: 25 },
            ];

            (supabase.from as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: mockItems, error: null }),
            }));

            const total = await portfolioService.getTotalValue(mockUserId);
            expect(total).toBe(200); // 100 + 75 + 25
        });

        it('should return 0 if no items found', async () => {
            (supabase.from as jest.Mock).mockImplementation(() => ({
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }));

            const total = await portfolioService.getTotalValue(mockUserId);
            expect(total).toBe(0);
        });
    });

    describe('get24hChange', () => {
        it('should calculate positive change correctly', async () => {
            // Current value mock (reusing logic implicitly or mocking internal call if possible, 
            // but here we mock the DB call for getTotalValue as well if we verified it calls it)
            // Since getTotalValue isn't mocked, we mock the DB response it relies on.
            const mockCurrentItems = [{ market_price: 150, manual_value: null }];

            // History mock
            const mockHistory = { total_value: 100, date: '2023-01-01' };

            // We need to mock the sequence of calls. 
            // 1. items (for getTotalValue)
            // 2. portfolio_history

            const selectMock = jest.fn();
            const eqMock = jest.fn();
            const orderMock = jest.fn();
            const limitMock = jest.fn();
            const singleMock = jest.fn();

            (supabase.from as jest.Mock).mockReturnValue({
                select: selectMock,
                eq: eqMock,
                insert: jest.fn(),
                order: orderMock,
                limit: limitMock,
                single: singleMock
            });

            // Mock implementation to return different data based on table name would be cleaner,
            // but strictly mocking the chain:

            // For items query
            selectMock.mockReturnThis();
            eqMock.mockImplementationOnce(() => Promise.resolve({ data: mockCurrentItems, error: null }));

            // For history query
            eqMock.mockReturnThis();
            orderMock.mockReturnThis();
            limitMock.mockReturnThis();
            singleMock.mockResolvedValue({ data: mockHistory, error: null });

            const result = await portfolioService.get24hChange(mockUserId);

            expect(result.total_value).toBe(150);
            expect(result.change_24h_value).toBe(50);
            expect(result.change_24h_percentage).toBe(50); // (50/100)*100
        });
    });
});
