import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Sentry Configuration
 * Centralized settings for Sentry initialization across the client.
 */
export const SENTRY_CONFIG: Sentry.ReactNativeOptions = {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || 'https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096',
    debug: false,
    environment: process.env.NODE_ENV || 'development',
    release: Constants.expoConfig?.version || '1.0.0',

    // Performance & Profiling
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Default PII inclusion for better debugging
    sendDefaultPii: true,

    // Sentry integrations are managed in App.tsx to handle instrumentation refs
};

export default SENTRY_CONFIG;
