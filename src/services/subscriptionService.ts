import Purchases, {
    LOG_LEVEL,
    CustomerInfo,
    PurchasesOffering,
    PACKAGE_TYPE,
    PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = 'Stamps & Coins Pro';

// Check if running in Expo Go (where RevenueCat doesn't work)
const isExpoGo = Constants.appOwnership === 'expo';

export const subscriptionService = {
    /**
     * Initialize RevenueCat SDK
     * NOTE: RevenueCat does not work in Expo Go - native modules are missing.
     * This is skipped in Expo Go to prevent the error banner.
     */
    async initialize(userId?: string) {
        if (isExpoGo) {
            console.log('[SubscriptionService] Running in Expo Go - RevenueCat is disabled');
            return;
        }

        try {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);

            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId || undefined });
            } else {
                await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId || undefined });
            }
            console.log('[SubscriptionService] RevenueCat initialized successfully');
        } catch (error) {
            console.error('[SubscriptionService] RevenueCat Configuration failed:', error);
        }
    },

    /**
     * Identify user in RevenueCat
     */
    async login(userId: string): Promise<CustomerInfo | null> {
        if (isExpoGo) return null as any;
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
        if (isExpoGo) return null;
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
        if (isExpoGo) return false;
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
        if (isExpoGo) return false;
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
        if (isExpoGo) return false;
        try {
            const customerInfo = await Purchases.restorePurchases();
            return typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== 'undefined';
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    },

};
