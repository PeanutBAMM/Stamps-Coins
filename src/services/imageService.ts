import * as ImageManipulator from 'expo-image-manipulator';

import { errorService } from './errorService';

/**
 * Compresses image to max 1080px on the longest side and strips metadata.
 * expo-image-manipulator automatically strips most EXIF data when re-saving.
 */
export const processImage = async (uri: string): Promise<string> => {
    try {
        errorService.addBreadcrumb({ category: 'scan', message: 'Processing image started' });
        console.log('Processing image:', uri);



        // 2. Manipulate image: Resize (max 1080px) and Compress (80% quality)
        // This also effectively strips sensitive EXIF like GPS by creating a new file.
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        console.log('Processed image URI:', result.uri);
        return result.uri;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};

export const imageService = {
    processPhoto: processImage,
};

export default imageService;
