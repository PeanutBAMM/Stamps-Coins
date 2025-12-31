const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'stamps-coins';

/**
 * Uploads an image to Cloudinary using fetching for React Native compatibility.
 * This avoids bundling heavy Node.js SDK dependencies.
 */
export const uploadImage = async (fileUri: string) => {
    try {
        console.log('Uploading to Cloudinary:', fileUri);

        const formData = new FormData();
        // @ts-ignore - React Native FormData expects an object for file
        formData.append('file', {
            uri: fileUri,
            type: 'image/jpeg',
            name: 'upload.jpg',
        });
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }

        const result = await response.json();
        console.log('Cloudinary upload success:', result.secure_url);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

export const cloudinaryService = {
    uploadImage,
};

export default cloudinaryService;
