import '@testing-library/jest-native/extend-expect';
import * as Sentry from '@sentry/node';

// Initialize Sentry for Test Environment
Sentry.init({
    dsn: process.env.SENTRY_DSN || 'https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096',
    environment: 'test',
    tracesSampleRate: 1.0,
    transport: () => ({
        send: () => Promise.resolve({ status: 'success' }),
        flush: () => Promise.resolve(true),
        close: () => Promise.resolve(true),
    }),
});

// Mock Sentry React Native to prevent crashes in Jest
jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    reactNavigationIntegration: jest.fn(() => ({
        registerNavigationContainer: jest.fn()
    })),
    mobileReplayIntegration: jest.fn(),
    feedbackIntegration: jest.fn(),
    hermesProfilingIntegration: jest.fn(),
    wrap: jest.fn((c) => c),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    addBreadcrumb: jest.fn(),
    setUser: jest.fn(),
    setTag: jest.fn(),
    ErrorBoundary: ({ children }) => children,
}));

// Global hook to capture test failures
afterEach(() => {
    const state = expect.getState();
    if (state.assertionCalls > 0 && state.error) {
        Sentry.captureException(state.error, {
            tags: {
                test_name: state.currentTestName,
                test_file: state.testPath,
                ai_context: 'jest_failure'
            },
            level: 'error'
        });
    }
});

// Mock Env Vars for Supabase
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Lucide Icons (return simple strings or View)
jest.mock('lucide-react-native', () => ({
    Search: () => 'Search',
    Filter: () => 'Filter',
    Grid: () => 'Grid',
    List: () => 'List',
    ArrowLeft: () => 'ArrowLeft',
    Trash2: () => 'Trash2',
    Edit2: () => 'Edit2',
    FolderInput: () => 'FolderInput',
    Clock: () => 'Clock',
    ExternalLink: () => 'ExternalLink',
    TrendingUp: () => 'TrendingUp',
    TrendingDown: () => 'TrendingDown',
    AlertTriangle: () => 'AlertTriangle',
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
    default: {
        call: () => { },
        createAnimatedComponent: (c) => c,
        View: 'View',
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
}));

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
        Swipeable: View,
        GestureHandlerRootView: View,
        State: {},
        Directions: {},
    };
});

// Mock Expo Blur
jest.mock('expo-blur', () => ({
    BlurView: 'View',
}));

// Mock Expo Image
jest.mock('expo-image', () => ({
    Image: 'Image',
}));

// Mock Expo Linear Gradient
jest.mock('expo-linear-gradient', () => ({
    LinearGradient: 'View',
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
    appOwnership: 'standalone',
    expoConfig: {
        extra: {
            // Add any extra config you need
        }
    }
}));

// Mock react-native-purchases (RevenueCat)
jest.mock('react-native-purchases', () => ({
    default: {
        setLogLevel: jest.fn(),
        configure: jest.fn(),
        logIn: jest.fn().mockResolvedValue({ customerInfo: {} }),
        getOfferings: jest.fn().mockResolvedValue({ current: null }),
        getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
        purchasePackage: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
        restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
    },
    LOG_LEVEL: { DEBUG: 'DEBUG' },
    PACKAGE_TYPE: {},
}));
