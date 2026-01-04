import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

// Mocks
jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    reactNavigationIntegration: jest.fn(() => ({
        registerNavigationContainer: jest.fn()
    })),
    mobileReplayIntegration: jest.fn(),
    feedbackIntegration: jest.fn(),
    hermesProfilingIntegration: jest.fn(),
    wrap: (Component: any) => Component,
    ErrorBoundary: ({ children }: any) => children,
}));

jest.mock('../../src/services/subscriptionService', () => ({
    subscriptionService: {
        initialize: jest.fn(),
    },
}));

jest.mock('../../src/hooks/useAuth', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../src/navigation/RootNavigator', () => ({
    RootNavigator: () => null,
}));

describe('App', () => {
    it('renders correctly', () => {
        const { toJSON } = render(<App />);
        expect(toJSON()).toMatchSnapshot();
    });
});
