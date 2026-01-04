import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import VaultsScreen from '../screens/VaultsScreen';
import { vaultService } from '../services/vaultService';
import { mockVaultStamps, mockVaultCoins, mockUserVaults } from './fixtures';

// Mock dependencies
jest.mock('../services/vaultService', () => ({
    vaultService: {
        getVaults: jest.fn(() => Promise.resolve([])),
        createVault: jest.fn(() => Promise.resolve({})),
        deleteVault: jest.fn(() => Promise.resolve()),
    },
}));

// Mock CreateVaultModal
jest.mock('../components/CreateVaultModal', () => {
    return function MockCreateVaultModal() {
        return null;
    };
});

// Mock Lucide icons
jest.mock('lucide-react-native', () => ({
    Plus: () => 'Plus',
    Trash2: () => 'Trash2',
    Package: () => 'Package',
}));

const mockNavigation = {
    navigate: jest.fn(),
    addListener: jest.fn(),
};

// Mock useFocusEffect
let focusCallback: (() => void) | null = null;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback: () => void) => {
        focusCallback = callback;
    },
}));

describe('VaultsScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        focusCallback = null;
    });

    it('renders vaults list with fixture data', async () => {
        (vaultService.getVaults as jest.Mock).mockResolvedValue(mockUserVaults);

        const { getByText } = render(<VaultsScreen navigation={mockNavigation} />);

        expect(getByText('Mijn Kluizen')).toBeTruthy();

        await act(async () => {
            if (focusCallback) focusCallback();
        });

        await waitFor(() => {
            expect(getByText(mockVaultStamps.name)).toBeTruthy();
            expect(getByText(mockVaultCoins.name)).toBeTruthy();
            expect(getByText(`€ ${(mockVaultStamps.total_value ?? 0).toFixed(2)}`)).toBeTruthy();
        });
    });

    it('navigates to VaultDetail on press', async () => {
        (vaultService.getVaults as jest.Mock).mockResolvedValue([mockVaultStamps]);

        const { getByText } = render(<VaultsScreen navigation={mockNavigation} />);

        await act(async () => {
            if (focusCallback) focusCallback();
        });

        await waitFor(() => getByText(mockVaultStamps.name));
        fireEvent.press(getByText(mockVaultStamps.name));

        expect(mockNavigation.navigate).toHaveBeenCalledWith('VaultDetail', {
            vaultId: mockVaultStamps.id,
            vaultName: mockVaultStamps.name,
        });
    });
});
