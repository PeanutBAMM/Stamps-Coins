export type VaultType = 'Stamps' | 'Coins' | 'Mixed';

export interface Vault {
    id: string;
    name: string;
    description?: string;
    type: VaultType;
    user_id: string;
    created_at: string;
    updated_at: string;
    // Computed/Joined fields
    item_count?: number;
    total_value?: number;
}

export interface CreateVaultDTO {
    name: string;
    description?: string;
    type: VaultType;
}

export interface UpdateVaultDTO {
    name?: string;
    description?: string;
    type?: VaultType;
}
