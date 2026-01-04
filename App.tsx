import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { subscriptionService } from './src/services/subscriptionService';
import { AuthProvider } from './src/hooks/useAuth';
import { ToastProvider } from './src/context/ToastContext';
import * as Linking from 'expo-linking';

// Polyfill for navigator.userAgent which is sometimes missing in Expo Go
// and required by some versions of RevenueCat (react-native-purchases)
if (typeof navigator === 'undefined') {
  (global as any).navigator = { userAgent: 'Expo/StampsCoins' };
} else if (!navigator.userAgent) {
  (navigator as any).userAgent = 'Expo/StampsCoins';
}

import { SENTRY_CONFIG } from './src/config/sentry';

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
    ...SENTRY_CONFIG,
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
  Sentry.init({
    ...SENTRY_CONFIG,
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

// Note: Console interceptors for Sentry are now handled by standard Sentry integrations.
// Explicit error reporting should be done via errorService.handleError().

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
    <Sentry.ErrorBoundary fallback={<View style={{ flex: 1, backgroundColor: '#000' }}><StatusBar style="light" /></View>}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <ToastProvider>
              <StatusBar style="light" />
              <RootNavigator routingInstrumentation={routingInstrumentation} />
            </ToastProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Sentry.ErrorBoundary>
  );
}

export default Sentry.wrap(App);