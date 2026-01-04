import { errorService, ErrorCategory } from '../errorService';
import * as Sentry from '@sentry/react-native';

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
    withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setExtras: jest.fn() })),
    captureException: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
}));

describe('errorService', () => {
    let mockScope: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockScope = {
            setTag: jest.fn(),
            setExtras: jest.fn(),
        };
        (Sentry.withScope as jest.Mock).mockImplementation((callback) => callback(mockScope));
    });

    describe('captureException', () => {
        it('should capture exception with category tag and extras', () => {
            const error = new Error('Test error');
            errorService.captureException(error, 'network', { some: 'extra' }, { custom: 'tag' });

            expect(Sentry.withScope).toHaveBeenCalled();
            expect(mockScope.setTag).toHaveBeenCalledWith('error_category', 'network');
            expect(mockScope.setTag).toHaveBeenCalledWith('custom', 'tag');
            expect(mockScope.setExtras).toHaveBeenCalledWith({ some: 'extra' });
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
        });
    });

    describe('setUser', () => {
        it('should set user with id and email', () => {
            errorService.setUser('user-123', 'test@example.com');

            expect(Sentry.setUser).toHaveBeenCalledWith({
                id: 'user-123',
                email: 'test@example.com',
            });
        });

        it('should clear user when passed null', () => {
            errorService.setUser(null);

            expect(Sentry.setUser).toHaveBeenCalledWith(null);
        });
    });

    describe('addBreadcrumb', () => {
        it('should add breadcrumb with category and message', () => {
            errorService.addBreadcrumb({
                category: 'navigation',
                message: 'User navigated to Dashboard',
            });

            expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
                category: 'navigation',
                message: 'User navigated to Dashboard',
                data: undefined,
                level: 'info',
            });
        });
    });

    describe('categorizeError', () => {
        const testCases: { message: string; expected: ErrorCategory }[] = [
            { message: 'Network request failed', expected: 'network' },
            { message: 'Fetch timeout', expected: 'network' },
            { message: 'Offline connection', expected: 'network' },
            { message: 'Auth session expired', expected: 'auth' },
            { message: 'Invalid token', expected: 'auth' },
            { message: 'User not found', expected: 'auth' },
            { message: 'Camera scan failed', expected: 'scan' },
            { message: 'Image processing error', expected: 'scan' },
            { message: 'Image manipulator failed', expected: 'scan' },
            { message: 'Payment declined', expected: 'payment' },
            { message: 'Subscription not found', expected: 'payment' },
            { message: 'RevenueCat error', expected: 'payment' },
            { message: 'Supabase query error', expected: 'database' },
            { message: 'Postgres error', expected: 'database' },
            { message: 'PGRST116 row not found', expected: 'database' },
            { message: 'Something went wrong', expected: 'unknown' },
        ];

        testCases.forEach(({ message, expected }) => {
            it(`should categorize "${message}" as "${expected}"`, () => {
                const error = new Error(message);
                expect(errorService.categorizeError(error)).toBe(expected);
            });
        });
    });

    describe('handleError', () => {
        it('should auto-categorize and capture error with context and tags', () => {
            const error = new Error('Network connection lost');
            errorService.handleError(error, 'Dashboard loading', { data: 123 }, { version: '1.0' });

            expect(mockScope.setTag).toHaveBeenCalledWith('error_category', 'network');
            expect(mockScope.setTag).toHaveBeenCalledWith('version', '1.0');
            expect(mockScope.setExtras).toHaveBeenCalledWith({ context: 'Dashboard loading', data: 123 });
            expect(Sentry.captureException).toHaveBeenCalledWith(error);
        });
    });
});
