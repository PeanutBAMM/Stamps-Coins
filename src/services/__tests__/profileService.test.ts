import { profileService } from '../profileService';
import { supabase } from '../../api/supabase';

jest.mock('../../api/supabase', () => ({
    supabase: {
        from: jest.fn(),
    },
}));

describe('profileService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch profile details', async () => {
        const mockProfile = { id: 'user-123', username: 'collector1' };
        const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
        const mockEq = jest.fn(() => ({ single: mockSingle }));
        const mockSelect = jest.fn(() => ({ eq: mockEq }));

        (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

        const profile = await profileService.getProfile('user-123');

        expect(supabase.from).toHaveBeenCalledWith('profiles');
        expect(mockSelect).toHaveBeenCalledWith('*');
        expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
        expect(profile).toEqual(mockProfile);
    });

    it('should get region', () => {
        const region = profileService.getRegion();
        expect(region).toBe('EU');
    });

    it('should get item count', async () => {
        const mockSelect = jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ count: 42, error: null })
        });

        (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

        const count = await profileService.getItemCount('user-123');

        expect(supabase.from).toHaveBeenCalledWith('items');
        expect(count).toBe(42);
    });
});
