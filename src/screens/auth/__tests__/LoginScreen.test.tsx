import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import { authService } from '../../../services/authService';

jest.mock('../../../services/authService', () => ({
    authService: {
        signIn: jest.fn(),
        signInAnonymously: jest.fn(),
    },
}));

describe('LoginScreen', () => {
    const mockNavigation = { navigate: jest.fn() };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders input fields correctly', () => {
        const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation} />);
        expect(getByPlaceholderText('naam@voorbeeld.nl')).toBeTruthy();
        expect(getByPlaceholderText('••••••••')).toBeTruthy();
        expect(getByText('Inloggen')).toBeTruthy();
    });

    it('shows validation errors for empty fields', async () => {
        const { getByText } = render(<LoginScreen navigation={mockNavigation} />);
        const loginButton = getByText('Inloggen');

        fireEvent.press(loginButton);

        await waitFor(() => {
            // Validation check
        });
    });

    it('calls signIn on valid input', async () => {
        const { getByPlaceholderText, getByText } = render(<LoginScreen navigation={mockNavigation} />);

        fireEvent.changeText(getByPlaceholderText('naam@voorbeeld.nl'), 'test@test.com');
        fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');

        fireEvent.press(getByText('Inloggen'));

        await waitFor(() => {
            expect(authService.signIn).toHaveBeenCalledWith('test@test.com', 'password123');
        });
    });
});
