import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingScreen from '../OnboardingScreen';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService', () => ({
    authService: {
        signInAnonymously: jest.fn(),
    },
}));

jest.mock('../../../components/CoachMark', () => ({
    CoachMark: () => null,
}));

describe('OnboardingScreen', () => {
    const mockNavigation = { navigate: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders first slide correctly', () => {
        const { getByText } = render(<OnboardingScreen navigation={mockNavigation} />);
        expect(getByText('Uw Cockpit')).toBeTruthy();
        expect(getByText('Volgende')).toBeTruthy();
    });

    it('navigates to Login on Skip press', async () => {
        const { getByText } = render(<OnboardingScreen navigation={mockNavigation} />);
        const skipButton = getByText('Overslaan');

        fireEvent.press(skipButton);

        await waitFor(() => {
            expect(authService.signInAnonymously).toHaveBeenCalled();
        });
    });
});
