import { Item, ItemCondition } from '../../types/item.types';

/**
 * Mock Stamps - Various conditions and prices
 */
export const mockStampMint: Item = {
    id: 'stamp-001',
    user_id: 'user-001',
    vault_id: 'vault-001',
    name: 'Blauwe Mauritius 1847',
    description: 'Two Pence Blue - One of the rarest stamps in the world',
    category: 'stamps',
    country: 'Mauritius',
    year: 1847,
    image_url: 'https://example.com/mauritius-blue.jpg',
    market_price: 1500000.00,
    manual_value: null,
    condition: 'Mint' as ItemCondition,
    confidence_score: 0.95,
    material: 'Paper',
    ignore_market_updates: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
};

export const mockStampExcellent: Item = {
    id: 'stamp-002',
    user_id: 'user-001',
    vault_id: 'vault-001',
    name: 'Penny Black 1840',
    description: 'The first adhesive postage stamp',
    category: 'stamps',
    country: 'United Kingdom',
    year: 1840,
    image_url: 'https://example.com/penny-black.jpg',
    market_price: 3500.00,
    manual_value: null,
    condition: 'Excellent' as ItemCondition,
    confidence_score: 0.88,
    material: 'Paper',
    ignore_market_updates: false,
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
};

export const mockStampWithManualPrice: Item = {
    id: 'stamp-003',
    user_id: 'user-001',
    vault_id: 'vault-002',
    name: 'Nederlandse Zomerzegel 1956',
    description: 'Kinderpostzegel serie',
    category: 'stamps',
    country: 'Netherlands',
    year: 1956,
    image_url: 'https://example.com/zomerzegel.jpg',
    market_price: 45.00,
    manual_value: 75.00,
    condition: 'Good' as ItemCondition,
    confidence_score: 0.72,
    material: 'Paper',
    ignore_market_updates: true,
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-12T16:45:00Z',
};

/**
 * Mock Coins - Various materials and conditions
 */
export const mockCoinGold: Item = {
    id: 'coin-001',
    user_id: 'user-001',
    vault_id: 'vault-003',
    name: 'Gouden Tientje Willem III',
    description: '10 Gulden gold coin, excellent preservation',
    category: 'coins',
    country: 'Netherlands',
    year: 1892,
    image_url: 'https://example.com/gouden-tientje.jpg',
    market_price: 450.00,
    manual_value: null,
    condition: 'Excellent' as ItemCondition,
    confidence_score: 0.91,
    material: 'Gold',
    ignore_market_updates: false,
    created_at: '2024-01-05T11:20:00Z',
    updated_at: '2024-01-05T11:20:00Z',
};

export const mockCoinSilver: Item = {
    id: 'coin-002',
    user_id: 'user-002',
    vault_id: 'vault-004',
    name: 'Morgan Silver Dollar',
    description: 'US Silver Dollar from the Carson City mint',
    category: 'coins',
    country: 'United States',
    year: 1889,
    image_url: 'https://example.com/morgan-dollar.jpg',
    market_price: 285.00,
    manual_value: null,
    condition: 'Good' as ItemCondition,
    confidence_score: 0.85,
    material: 'Silver',
    ignore_market_updates: false,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-01T08:00:00Z',
};

export const mockCoinBronze: Item = {
    id: 'coin-003',
    user_id: 'user-001',
    vault_id: 'vault-003',
    name: 'Roman Sestertius',
    description: 'Bronze coin from Emperor Hadrian era',
    category: 'coins',
    country: 'Roman Empire',
    year: 125,
    image_url: 'https://example.com/sestertius.jpg',
    market_price: 1200.00,
    manual_value: null,
    condition: 'Fair' as ItemCondition,
    confidence_score: 0.65,
    material: 'Bronze',
    ignore_market_updates: false,
    created_at: '2024-03-01T15:30:00Z',
    updated_at: '2024-03-01T15:30:00Z',
};

/**
 * Item Collections for bulk testing
 */
export const mockStampCollection: Item[] = [
    mockStampMint,
    mockStampExcellent,
    mockStampWithManualPrice,
];

export const mockCoinCollection: Item[] = [
    mockCoinGold,
    mockCoinSilver,
    mockCoinBronze,
];

export const mockMixedCollection: Item[] = [
    ...mockStampCollection,
    ...mockCoinCollection,
];
