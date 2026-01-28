import {v2 as cloudinary} from 'cloudinary';
import multer from 'multer';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'resumeefy',
        allowed_formats: ['pdf', 'doc', 'docx'],
        resource_type: 'raw',
        public_id: (req, file) => `resume_S${req.user._id}-${Date.now()}`
    },
});

const upload = multer({ 
    storage: storage,
    limits: { filesize: 5 * 1024 * 1024}
});

export default upload;  