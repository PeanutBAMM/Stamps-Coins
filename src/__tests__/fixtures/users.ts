/**
 * Mock User Profiles - Free and Pro accounts
 */
export interface MockUser {
    id: string;
    email: string;
    pro_status: boolean;
    region: string;
    item_count: number;
    currency: string;
    created_at: string;
}

export const mockFreeUser: MockUser = {
    id: 'user-001',
    email: 'verzamelaar@example.com',
    pro_status: false,
    region: 'EU',
    item_count: 28,
    currency: 'EUR',
    created_at: '2024-01-01T00:00:00Z',
};

export const mockProUser: MockUser = {
    id: 'user-002',
    email: 'pro.collector@example.com',
    pro_status: true,
    region: 'NA',
    item_count: 156,
    currency: 'USD',
    created_at: '2023-06-15T00:00:00Z',
};

export const mockNewUser: MockUser = {
    id: 'user-003',
    email: 'nieuw@example.com',
    pro_status: false,
    region: 'EU',
    item_count: 0,
    currency: 'EUR',
    created_at: '2024-03-20T00:00:00Z',
};

export const mockMaxItemsUser: MockUser = {
    id: 'user-004',
    email: 'bijna.vol@example.com',
    pro_status: false,
    region: 'EU',
    item_count: 35, // At free tier limit
    currency: 'EUR',
    created_at: '2024-02-10T00:00:00Z',
};

/**
 * Auth session mocks
 */
export const mockSession = {
    access_token: 'mock-access-token-12345',
    refresh_token: 'mock-refresh-token-67890',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
        id: mockFreeUser.id,
        email: mockFreeUser.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: mockFreeUser.created_at,
    },
};

export const mockProSession = {
    ...mockSession,
    user: {
        ...mockSession.user,
        id: mockProUser.id,
        email: mockProUser.email,
    },
};
