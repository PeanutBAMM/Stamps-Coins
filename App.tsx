import React, { useEffect } from 'react';
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

Sentry.init({
  dsn: 'https://1e49252d46837eec4a749039fba24a55@o4510631175782400.ingest.de.sentry.io/4510631177814096',
  debug: true,
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],
});

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
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}

export default Sentry.wrap(App);