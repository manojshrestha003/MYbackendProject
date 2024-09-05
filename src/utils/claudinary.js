import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) {
        console.error('No file path provided.');
        return null;
    }

    try {
        // Upload file and wait for the result
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Log the URL of the uploaded file
        console.log("File is uploaded to Cloudinary:", response.url);
        return response;
    } catch (error) {
        // Log detailed error information
        console.error("Cloudinary upload error:", {
            message: error.message,
            stack: error.stack,
            response: error.response ? error.response.data : 'No response data'
        });
        throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
    } finally {
        // Ensure the file is deleted if it exists
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log('Local file removed:', localFilePath);
        }
    }
};

export { uploadOnCloudinary };
