import { v2 as cloudinary } from 'cloudinary';

// Note: In a real React Native environment, we usually use the Upload API directly 
// via fetch/axios or a specific client library rather than the Node.js SDK 
// if we want to avoid bundling Node-specific dependencies.
// However, for Edge Functions or if using a compatible environment:

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

export const uploadImage = async (fileUri: string) => {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: 'stamps-coins',
            quality: 'auto',
            fetch_format: 'auto',
        });
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export default cloudinary;
