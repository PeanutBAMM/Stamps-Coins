import { imageService } from '../imageService';
import * as ImageManipulator from 'expo-image-manipulator';

// Mock errorService (used for breadcrumbs)
jest.mock('../errorService', () => ({
    errorService: { addBreadcrumb: jest.fn() },
}));

jest.mock('expo-image-manipulator', () => ({
    manipulateAsync: jest.fn(),
    SaveFormat: { JPEG: 'jpeg' }
}));

describe('imageService', () => {
    const mockUri = 'file:///test/image.jpg';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('processPhoto', () => {
        it('should compress and resize the image', async () => {
            const processedUri = 'file:///test/processed.jpg';
            (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
                uri: processedUri,
                width: 1080,
                height: 1080,
            });

            const result = await imageService.processPhoto(mockUri);

            expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
                mockUri,
                [{ resize: { width: 1080 } }],
                { compress: 0.8, format: 'jpeg' }
            );
            expect(result).toBe(processedUri);
        });

        it('should propagate errors from ImageManipulator', async () => {
            const error = new Error('Manipulation failed');
            (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(error);

            await expect(imageService.processPhoto(mockUri)).rejects.toThrow('Manipulation failed');
        });
    });
});
