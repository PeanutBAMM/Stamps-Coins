import { cloudinaryService } from '../cloudinaryService';

describe('cloudinaryService', () => {
    const mockUri = 'file:///test/image.jpg';
    const mockResponse = {
        secure_url: 'https://cloudinary.com/test.jpg',
    };

    beforeEach(() => {
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    it('should upload image successfully', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue(mockResponse),
        });

        const result = await cloudinaryService.uploadImage(mockUri);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('https://api.cloudinary.com/v1_1/'),
            expect.objectContaining({
                method: 'POST',
                body: expect.any(FormData),
            })
        );
        expect(result.secure_url).toBe(mockResponse.secure_url);
    });

    it('should throw error on upload failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({ error: { message: 'Upload failed' } }),
        });

        await expect(cloudinaryService.uploadImage(mockUri)).rejects.toThrow('Upload failed');
    });
});
