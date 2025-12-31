import { authService } from '../authService';
import { supabase } from '../../api/supabase';

// Mock errorService
jest.mock('../errorService', () => ({
    errorService: {
        addBreadcrumb: jest.fn(),
        setUser: jest.fn(),
    },
}));

jest.mock('../../api/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            getUser: jest.fn(),
            signInAnonymously: jest.fn(),
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            updateUser: jest.fn(),
            signOut: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            onAuthStateChange: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
            update: jest.fn(() => ({
                eq: jest.fn(),
            })),
        })),
    },
}));

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get the current session', async () => {
        const mockSession = { user: { id: 'test-user' } };
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: mockSession },
            error: null,
        });

        const session = await authService.getSession();
        expect(session).toEqual(mockSession);
        expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should sign in anonymously', async () => {
        const mockData = { user: { id: 'anon-user' } };
        (supabase.auth.signInAnonymously as jest.Mock).mockResolvedValue({
            data: mockData,
            error: null,
        });

        const data = await authService.signInAnonymously();
        expect(data).toEqual(mockData);
        expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
    });

    it('should sign up with email and password', async () => {
        const mockData = { user: { id: 'new-user' } };
        (supabase.auth.signUp as jest.Mock).mockResolvedValue({
            data: mockData,
            error: null,
        });

        const data = await authService.signUp('test@example.com', 'password123');
        expect(data).toEqual(mockData);
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
        });
    });

    it('should throw error if getSession fails', async () => {
        (supabase.auth.getSession as jest.Mock).mockResolvedValue({
            data: { session: null },
            error: new Error('Session error'),
        });

        await expect(authService.getSession()).rejects.toThrow('Session error');
    });
});
