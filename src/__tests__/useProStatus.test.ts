import { renderHook, waitFor } from '@testing-library/react-native';
import { useProStatus } from '../hooks/useProStatus';
import { subscriptionService } from '../services/subscriptionService';
import { profileService } from '../services/profileService';
// We don't import useAuth directly for mocking because we mock the module

// Mock dependencies
jest.mock('../services/subscriptionService');
jest.mock('../services/profileService');

// Dynamic mock for useAuth
const mockUseAuthReturn = jest.fn();
jest.mock('../hooks/useAuth', () => ({
    useAuth: () => mockUseAuthReturn()
}));

describe('useProStatus', () => {
    const mockUser = { id: 'test-user-id' };

    beforeEach(() => {
        jest.clearAllMocks();
        // Default Mock Return
        mockUseAuthReturn.mockReturnValue({ user: mockUser });
    });

    it('should return false initially and then true if subscriptionService returns true', async () => {
        (subscriptionService.checkProStatus as jest.Mock).mockResolvedValue(true);
        (profileService.getProfile as jest.Mock).mockResolvedValue({ pro_status: false });

        const { result } = renderHook(() => useProStatus());

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isPro).toBe(true);
        expect(subscriptionService.checkProStatus).toHaveBeenCalled();
    });

    it('should fall back to database profile if subscriptionService returns false', async () => {
        (subscriptionService.checkProStatus as jest.Mock).mockResolvedValue(false);
        (profileService.getProfile as jest.Mock).mockResolvedValue({ pro_status: true });

        const { result } = renderHook(() => useProStatus());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isPro).toBe(true);
    });

    it('should return false if both services return false', async () => {
        (subscriptionService.checkProStatus as jest.Mock).mockResolvedValue(false);
        (profileService.getProfile as jest.Mock).mockResolvedValue({ pro_status: false });

        const { result } = renderHook(() => useProStatus());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isPro).toBe(false);
    });

    // Test for handling errors
    it('should handle errors gracefully and default to false', async () => {
        (subscriptionService.checkProStatus as jest.Mock).mockRejectedValue(new Error('Network error'));
        (profileService.getProfile as jest.Mock).mockResolvedValue({ pro_status: false });

        const { result } = renderHook(() => useProStatus());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isPro).toBe(false);
    });

    // Test for logged out state
    it('should return false instantly if no user is logged in', async () => {
        mockUseAuthReturn.mockReturnValue({ user: null });

        const { result } = renderHook(() => useProStatus());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.isPro).toBe(false);
        expect(subscriptionService.checkProStatus).not.toHaveBeenCalled();
    });
});
