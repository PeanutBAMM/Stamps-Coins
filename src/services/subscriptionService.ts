import Purchases, {
    LOG_LEVEL,
    CustomerInfo,
    PurchasesOffering,
    PACKAGE_TYPE,
    PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = 'Stamps & Coins Pro';

export const subscriptionService = {
    /**
     * Initialize RevenueCat SDK
     */
    async initialize(userId?: string) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        // Configure with API Key
        if (Platform.OS === 'ios') {
            Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
        } else {
            Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
        }
    },

    /**
     * Identify user in RevenueCat
     */
    async login(userId: string): Promise<CustomerInfo> {
        try {
            const { customerInfo } = await Purchases.logIn(userId);
            return customerInfo;
        } catch (error) {
            console.error('RevenueCat Login error:', error);
            throw error;
        }
    },

    /**
     * Get current offerings/products
     */
    async getOfferings(): Promise<PurchasesOffering | null> {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null) {
                return offerings.current;
            }
            return null;
        } catch (error) {
            console.error('Error fetching offerings:', error);
            return null;
        }
    },

    /**
     * Check if user has active pro subscription
     */
    async checkProStatus(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        } catch (error) {
            console.error('Error checking pro status:', error);
            return false;
        }
    },

    /**
     * Process a purchase
     */
    async purchasePackage(pack: PurchasesPackage): Promise<boolean> {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        } catch (error: any) {
            if (!error.userCancelled) {
                console.error('Purchase error:', error);
            }
            return false;
        }
    },

    /**
     * Restore previous purchases
     */
    async restorePurchases(): Promise<boolean> {
        try {
            const customerInfo = await Purchases.restorePurchases();
            return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    },
};
