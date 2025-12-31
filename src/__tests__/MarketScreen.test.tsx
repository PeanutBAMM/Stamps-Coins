import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MarketScreen from '../screens/MarketScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        goBack: jest.fn(),
    }),
}));

// Mock supabase
jest.mock('../api/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
        })),
    },
}));

describe('MarketScreen', () => {
    it('renders the header correctly', () => {
        const { getByText } = render(<MarketScreen />);
        expect(getByText('Market Insights')).toBeTruthy();
    });

    it('renders the news filters', () => {
        const { getByText } = render(<MarketScreen />);
        expect(getByText('All')).toBeTruthy();
        expect(getByText('Coin')).toBeTruthy();
        expect(getByText('Stamp')).toBeTruthy();
    });

    it('renders mock news items', () => {
        const { getByText } = render(<MarketScreen />);
        // Check for a known mock item title
        expect(getByText(/Gouden Tientje/)).toBeTruthy();
    });

    it('filters news when a category is selected', () => {
        const { getByText, queryByText } = render(<MarketScreen />);

        // Select 'Stamp' filter
        fireEvent.press(getByText('Stamp'));

        // Should show stamp news
        expect(getByText(/PostNL/)).toBeTruthy();
    });
});
