import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

if (!CLOUDINARY_URL) {
    console.error('❌ Error: CLOUDINARY_URL environment variable is missing.');
    console.log('Usage: set CLOUDINARY_URL=... && npx tsx scripts/setup-cloudinary.ts');
    process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
    cloudinary_url: CLOUDINARY_URL,
});

async function setup() {
    console.log('🔧 Setting up Cloudinary...');

    try {
        const presetName = 'stamps-coins';

        console.log(`Checking/Creating upload preset: ${presetName}...`);

        // Check if exists or just create/update (upsert-like behavior via create usually fails if name taken, update works for existing)
        // We try to create an unsigned preset

        try {
            await cloudinary.api.create_upload_preset({
                name: presetName,
                unsigned: true,
                folder: 'stamps-coins-uploads',
                allowed_formats: 'jpg,png,jpeg,webp',
            });
            console.log(`✅ Success: Unsigned upload preset '${presetName}' created!`);
        } catch (error: any) {
            if (error.error?.message?.includes('already exists')) {
                console.log(`ℹ️ Preset '${presetName}' already exists. Updating to ensure it is unsigned...`);
                await cloudinary.api.update_upload_preset(presetName, {
                    unsigned: true,
                    folder: 'stamps-coins-uploads',
                });
                console.log(`✅ Success: Upload preset '${presetName}' updated!`);
            } else {
                throw error;
            }
        }

    } catch (error: any) {
        console.error('❌ Setup failed:', error.message || error);
        process.exit(1);
    }
}

setup();
