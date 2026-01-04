import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import VaultDetailScreen from '../screens/VaultDetailScreen';
import { itemService } from '../services/itemService';
import { mockStampMint, mockCoinGold, mockStampCollection } from './fixtures';

// Mock dependencies
jest.mock('../services/itemService', () => ({
    itemService: {
        getItemsByVault: jest.fn(() => Promise.resolve([])),
    },
}));

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
    Search: () => 'Search',
    Filter: () => 'Filter',
    Grid: () => 'Grid',
    List: () => 'List',
    ArrowLeft: () => 'ArrowLeft',
}));

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
};

const mockRoute = {
    params: { vaultId: 'vault-001', vaultName: 'Test Vault' },
};

// Mock useFocusEffect
let focusCallback: (() => void) | null = null;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback: () => void) => {
        focusCallback = callback;
    },
}));

describe('VaultDetailScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        focusCallback = null;
    });

    it('renders vault name and items from fixtures', async () => {
        (itemService.getItemsByVault as jest.Mock).mockResolvedValue(mockStampCollection);

        const { getByText } = render(
            <VaultDetailScreen navigation={mockNavigation} route={mockRoute} />
        );

        expect(getByText('Test Vault')).toBeTruthy();

        await act(async () => {
            if (focusCallback) focusCallback();
        });

        await waitFor(() => {
            expect(getByText(mockStampMint.name)).toBeTruthy();
        });
    });

    it('handles empty vault gracefully', async () => {
        (itemService.getItemsByVault as jest.Mock).mockResolvedValue([]);

        const { getByText } = render(
            <VaultDetailScreen navigation={mockNavigation} route={mockRoute} />
        );

        await act(async () => {
            if (focusCallback) focusCallback();
        });

        expect(getByText('Test Vault')).toBeTruthy();
    });

    it('displays coin items correctly', async () => {
        (itemService.getItemsByVault as jest.Mock).mockResolvedValue([mockCoinGold]);

        const { getByText } = render(
            <VaultDetailScreen navigation={mockNavigation} route={mockRoute} />
        );

        await act(async () => {
            if (focusCallback) focusCallback();
        });

        await waitFor(() => {
            expect(getByText(mockCoinGold.name)).toBeTruthy();
        });
    });
});
