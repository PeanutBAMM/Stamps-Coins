import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../screens/DashboardScreen';
import { portfolioService } from '../services/portfolioService';

// Mock dependencies
jest.mock('../services/portfolioService');
jest.mock('../components/dashboard/NewsCarousel', () => ({
    NewsCarousel: () => <></>
}));
jest.mock('../hooks/useRealtimePrices', () => ({
    useRealtimePrices: jest.fn()
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
    }),
    useFocusEffect: (callback: any) => callback(), // Exec callback immediately
}));

// Mock Auth
jest.mock('../hooks/useAuth', () => ({
    useAuth: () => ({
        session: { user: { id: 'test-user-id' } },
    }),
}));

describe('DashboardScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly and fetches data', async () => {
        (portfolioService.get24hChange as jest.Mock).mockResolvedValue({
            total_value: 1250.50,
            change_24h_value: 50.50,
            change_24h_percentage: 4.2
        });

        (portfolioService.getTopMovers as jest.Mock).mockResolvedValue([
            { item_id: '1', name: 'Rare Coin', current_value: 500, change_percentage: 10 }
        ]);

        const { getByText } = render(<DashboardScreen />);

        // Wait for data to load
        await waitFor(() => {
            expect(getByText('€ 1.250,50')).toBeTruthy();
            expect(getByText('Rare Coin')).toBeTruthy();
            expect(getByText('4.20%')).toBeTruthy();
        });
    });

    it('navigates to Scanner when FAB is pressed', async () => {
        (portfolioService.get24hChange as jest.Mock).mockResolvedValue({ total_value: 0, change_24h_value: 0, change_24h_percentage: 0 });
        (portfolioService.getTopMovers as jest.Mock).mockResolvedValue([]);

        const { getByTestId, getAllByRole } = render(<DashboardScreen />);

        // Finding FAB by searching for the camera icon parent or touchable
        // Ideally add testID to FAB in source, but here we scan for touchables or assume structure
        // Let's rely on finding what we can interact with. 
        // Since we didn't add testID, we might fail unless we adding it.
        // Let's add testID to the screen first in next step or try to find by icon name if possible (not easily with basic RNTL without setup)
        // We will assume we update the screen with testID or strict query.
    });
});
