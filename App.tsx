import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { subscriptionService } from './src/services/subscriptionService';
import { AuthProvider } from './src/hooks/useAuth';

// Polyfill for navigator.userAgent which is sometimes missing in Expo Go
// and required by some versions of RevenueCat (react-native-purchases)
if (typeof navigator === 'undefined') {
  (global as any).navigator = { userAgent: 'Expo/StampsCoins' };
} else if (!navigator.userAgent) {
  (navigator as any).userAgent = 'Expo/StampsCoins';
}

const isJest = !!process.env.JEST_WORKER_ID;

// Detect Expo Go - Sentry native modules don't work there
let isExpoGo = false;
try {
  const Constants = require('expo-constants').default;
  isExpoGo = Constants.appOwnership === 'expo';
} catch (e) {
  // expo-constants not available
}

const shouldInitSentry = !isJest && !isExpoGo;

const routingInstrumentation = shouldInitSentry
  ? Sentry.reactNavigationIntegration()
  : ({ registerNavigationContainer: () => { } } as any);

if (shouldInitSentry) {
  Sentry.init({
    dsn: 'https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096',
    debug: false,
    sendDefaultPii: true,
    enableLogs: true,
    environment: process.env.NODE_ENV || 'development',

    // Performance & Profiling (Dec 2025 Best Practice)
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,

    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
      Sentry.hermesProfilingIntegration(),
      routingInstrumentation,
    ],
  });

  // AI-Optimized Global Metadata
  Sentry.setTag('ai.context', 'active_coding_session');
  Sentry.setTag('error.scope', 'full_scope_logging_v2');
  if ((global as any).__METRO_GLOBAL_PREFIX__ === 'maestro') {
    Sentry.setTag('test_type', 'e2e_maestro');
    Sentry.setTag('environment', 'automation');
  }
} else if (isExpoGo) {
  // Expo Go: Initialize Sentry with JS-only config (no native modules)
  // This ensures console.error/warn interceptors still send to Sentry
  Sentry.init({
    dsn: 'https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096',
    debug: false,
    environment: 'expo-go-development',
    enableNative: false, // Disable native crash reporting
    enableNativeNagger: false, // Don't show warning about native
    integrations: [], // No native integrations
  });
  Sentry.setTag('runtime', 'expo_go');
  Sentry.setTag('ai.context', 'dev_session');
  console.log('[Sentry] Running in Expo Go - JS-only mode enabled');
} else {
  console.log('[Sentry] Running in Jest - Sentry disabled');
}

// Enhanced Sentry interceptor to capture errors and warnings with better visibility
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

const captureToSentry = (level: Sentry.SeverityLevel, ...args: any[]) => {
  const messageChunks = args.map(arg => {
    if (arg instanceof Error) return arg.message;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });

  const fullMessage = messageChunks.join(' ');
  const title = messageChunks[0] || 'Empty Log';

  if (args[0] instanceof Error) {
    Sentry.captureException(args[0], { level, extra: { fullMessage } });
  } else {
    Sentry.captureMessage(fullMessage, {
      level,
      tags: { log_title: title.substring(0, 100) },
      fingerprint: [title] // Force separate issues for different log titles
    });
  }
};

console.error = (...args: any[]) => {
  captureToSentry('error', ...args);
  originalConsoleError(...args);
};

console.warn = (...args: any[]) => {
  captureToSentry('warning', ...args);
  originalConsoleWarn(...args);
};

function App() {
  useEffect(() => {
    // Initialize RevenueCat with error handling
    const initRC = async () => {
      try {
        await subscriptionService.initialize();
      } catch (error) {
        console.error('RevenueCat Initialization failed:', error);
      }
    };
    initRC();
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<View><StatusBar style="light" /></View>}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator routingInstrumentation={routingInstrumentation} />
      </AuthProvider>
    </Sentry.ErrorBoundary>
  );
}

export default Sentry.wrap(App);