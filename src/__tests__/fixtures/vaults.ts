import { Vault, VaultType } from '../../types/vault.types';

/**
 * Mock Vaults - Various types and sizes
 */
export const mockVaultStamps: Vault = {
    id: 'vault-001',
    user_id: 'user-001',
    name: 'Postzegelverzameling',
    description: 'Mijn zeldzame postzegels uit Europa',
    type: 'Stamps' as VaultType,
    item_count: 24,
    total_value: 12450.00,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
};

export const mockVaultCoins: Vault = {
    id: 'vault-003',
    user_id: 'user-001',
    name: 'Gouden Munten',
    description: 'Nederlandse gouden munten collectie',
    type: 'Coins' as VaultType,
    item_count: 8,
    total_value: 4850.00,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
};

export const mockVaultMixed: Vault = {
    id: 'vault-002',
    user_id: 'user-001',
    name: 'Te Verkopen',
    description: 'Items die ik wil verkopen',
    type: 'Mixed' as VaultType,
    item_count: 15,
    total_value: 2340.00,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
};

export const mockVaultEmpty: Vault = {
    id: 'vault-005',
    user_id: 'user-001',
    name: 'Nieuwe Kluis',
    description: 'Nog leeg',
    type: 'Mixed' as VaultType,
    item_count: 0,
    total_value: 0,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
};

export const mockVaultOtherUser: Vault = {
    id: 'vault-004',
    user_id: 'user-002',
    name: 'American Coins',
    description: 'US Dollar collection',
    type: 'Coins' as VaultType,
    item_count: 12,
    total_value: 3420.00,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
};

/**
 * Vault Collections for testing
 */
export const mockUserVaults: Vault[] = [
    mockVaultStamps,
    mockVaultCoins,
    mockVaultMixed,
    mockVaultEmpty,
];

export const mockAllVaults: Vault[] = [
    ...mockUserVaults,
    mockVaultOtherUser,
];
