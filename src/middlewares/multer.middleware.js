import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the path to the 'public/temp' folder
const uploadDirectory = path.join( 'public', 'temp');

// Ensure the 'public/temp' directory exists
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);  // Use the correct relative path
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);  // Generate a unique filename
    }
});

export const upload = multer({ storage: storage });
