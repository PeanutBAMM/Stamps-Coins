/**
 * Integration Test - Ghost to Email Conversion
 * Tests the account upgrade flow from anonymous to authenticated user.
 */
import { authService } from '../../services/authService';
import { supabase } from '../../api/supabase';

// Mock Supabase
jest.mock('../../api/supabase', () => ({
    supabase: {
        auth: {
            signInAnonymously: jest.fn(),
            updateUser: jest.fn(),
            getSession: jest.fn(),
            getUser: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
            update: jest.fn().mockReturnThis(),
        })),
    },
}));

// Mock errorService
jest.mock('../../services/errorService', () => ({
    errorService: {
        addBreadcrumb: jest.fn(),
        setUser: jest.fn(),
    },
}));

describe('Ghost to Email Conversion Integration', () => {
    const mockGhostUser = {
        id: 'ghost-user-123',
        email: null,
        is_anonymous: true,
    };

    const mockConvertedUser = {
        id: 'ghost-user-123', // Same ID preserved
        email: 'upgraded@example.com',
        is_anonymous: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Anonymous Sign In (Ghost Mode)', () => {
        it('should create anonymous session successfully', async () => {
            (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
                data: { user: mockGhostUser, session: { access_token: 'token' } },
                error: null,
            });

            const result = await authService.signInAnonymously();

            expect(result.user?.is_anonymous).toBe(true);
            expect(result.user?.email).toBeNull();
            expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
        });

        it('should throw error on anonymous sign in failure', async () => {
            (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
                data: null,
                error: new Error('Anonymous auth disabled'),
            });

            await expect(authService.signInAnonymously()).rejects.toThrow('Anonymous auth disabled');
        });
    });

    describe('Account Conversion (Ghost to Email)', () => {
        it('should convert ghost account to email account', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
                data: { user: mockConvertedUser },
                error: null,
            });

            const result = await authService.convertGhostToEmail(
                'upgraded@example.com',
                'SecurePass123!'
            );

            expect(result.user?.email).toBe('upgraded@example.com');
            expect(result.user?.id).toBe(mockGhostUser.id); // Same user ID preserved
            expect(supabase.auth.updateUser).toHaveBeenCalledWith({
                email: 'upgraded@example.com',
                password: 'SecurePass123!',
            });
        });

        it('should preserve user ID after conversion', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
                data: { user: mockConvertedUser },
                error: null,
            });

            const result = await authService.convertGhostToEmail('test@example.com', 'pass');

            // Most important: user ID stays the same so all items/vaults are preserved
            expect(result.user?.id).toBe(mockGhostUser.id);
        });

        it('should throw error when email already in use', async () => {
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
                data: null,
                error: new Error('Email already registered'),
            });

            await expect(
                authService.convertGhostToEmail('existing@example.com', 'pass')
            ).rejects.toThrow('Email already registered');
        });
    });

    describe('Data Preservation', () => {
        it('should maintain access to items after conversion', async () => {
            // Simulate the flow: ghost user creates items, then converts
            // After conversion, same user ID = same items access via RLS

            // 1. Ghost signs in
            (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
                data: { user: mockGhostUser },
                error: null,
            });

            const ghostData = await authService.signInAnonymously();
            const originalUserId = ghostData.user?.id;

            // 2. Ghost converts to email
            (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
                data: { user: mockConvertedUser },
                error: null,
            });

            const convertedData = await authService.convertGhostToEmail('test@test.com', 'pass');

            // 3. Verify user ID is preserved (critical for RLS)
            expect(convertedData.user?.id).toBe(originalUserId);
        });
    });
});
