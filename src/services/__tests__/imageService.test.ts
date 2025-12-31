import { imageService } from '../imageService';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
    SaveFormat: { JPEG: 'jpeg' }
}));

jest.mock('expo-file-system', () => ({
    getInfoAsync: jest.fn(),
}));

describe('imageService', () => {
    const mockUri = 'file:///test/image.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('processPhoto', () => {
        it('should compress and resize the image', async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
            (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
                uri: 'file:///test/processed.jpg',
                width: 1080,
                height: 1080,
            });

            const result = await imageService.processPhoto(mockUri);

            expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(mockUri);
            expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
                mockUri,
                [{ resize: { width: 1080 } }],
                { compress: 0.8, format: 'jpeg' }
            );
            expect(result.uri).toBe('file:///test/processed.jpg');
        });

        it('should throw error if file does not exist', async () => {
            (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

            await expect(imageService.processPhoto(mockUri)).rejects.toThrow('File does not exist');
        });
    });
});
