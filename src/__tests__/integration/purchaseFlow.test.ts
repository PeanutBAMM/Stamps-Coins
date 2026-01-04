/**
 * Integration Test - Purchase Flow
 * Tests the complete purchase process from paywall to subscription activation.
 */
import { subscriptionService } from '../../services/subscriptionService';
import Purchases from 'react-native-purchases';

// Mock RevenueCat
jest.mock('react-native-purchases', () => ({
    setLogLevel: jest.fn(),
    configure: jest.fn(),
    logIn: jest.fn(),
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    LOG_LEVEL: { DEBUG: 'DEBUG' },
    PACKAGE_TYPE: { MONTHLY: 'MONTHLY' },
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

const mockPackage = {
    identifier: 'pro_monthly',
    packageType: 'MONTHLY',
    product: { priceString: '€7,99' },
};

const mockActiveEntitlement = {
    'Stamps & Coins Pro': { isActive: true },
};

describe('Purchase Flow Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('SDK Initialization', () => {
        it('should initialize RevenueCat with API key', async () => {
            await subscriptionService.initialize('user-123');

            expect(Purchases.setLogLevel).toHaveBeenCalled();
            expect(Purchases.configure).toHaveBeenCalledWith(
                expect.objectContaining({ appUserID: 'user-123' })
            );
        });
    });

    describe('Offerings & Products', () => {
        it('should fetch current offerings', async () => {
            (Purchases.getOfferings as jest.Mock).mockResolvedValue({
                current: {
                    identifier: 'default',
                    availablePackages: [mockPackage],
                },
            });

            const offering = await subscriptionService.getOfferings();

            expect(offering).not.toBeNull();
            expect(offering?.identifier).toBe('default');
        });

        it('should return null when no offerings available', async () => {
            (Purchases.getOfferings as jest.Mock).mockResolvedValue({ current: null });

            const offering = await subscriptionService.getOfferings();

            expect(offering).toBeNull();
        });
    });

    describe('Pro Status Check', () => {
        it('should return true when user has active pro subscription', async () => {
            (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
                entitlements: { active: mockActiveEntitlement },
            });

            const isPro = await subscriptionService.checkProStatus();

            expect(isPro).toBe(true);
        });

        it('should return false when no active subscription', async () => {
            (Purchases.getCustomerInfo as jest.Mock).mockResolvedValue({
                entitlements: { active: {} },
            });

            const isPro = await subscriptionService.checkProStatus();

            expect(isPro).toBe(false);
        });
    });

    describe('Purchase Process', () => {
        it('should complete purchase and return true on success', async () => {
            (Purchases.purchasePackage as jest.Mock).mockResolvedValue({
                customerInfo: { entitlements: { active: mockActiveEntitlement } },
            });

            const success = await subscriptionService.purchasePackage(mockPackage as any);

            expect(success).toBe(true);
            expect(Purchases.purchasePackage).toHaveBeenCalledWith(mockPackage);
        });

        it('should return false when purchase cancelled', async () => {
            (Purchases.purchasePackage as jest.Mock).mockRejectedValue({
                userCancelled: true,
            });

            const success = await subscriptionService.purchasePackage(mockPackage as any);

            expect(success).toBe(false);
        });
    });

    describe('Restore Purchases', () => {
        it('should restore purchases and return true if pro exists', async () => {
            (Purchases.restorePurchases as jest.Mock).mockResolvedValue({
                entitlements: { active: mockActiveEntitlement },
            });

            const restored = await subscriptionService.restorePurchases();

            expect(restored).toBe(true);
        });

        it('should return false when no purchases to restore', async () => {
            (Purchases.restorePurchases as jest.Mock).mockResolvedValue({
                entitlements: { active: {} },
            });

            const restored = await subscriptionService.restorePurchases();

            expect(restored).toBe(false);
        });
    });
});
