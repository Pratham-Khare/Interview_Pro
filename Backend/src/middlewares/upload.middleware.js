import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/**
 * @name storage
 * @description Configures Cloudinary storage for avatar uploads.
 */
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "interview-ai-avatars",
        allowed_formats: ["jpg", "png", "jpeg"]
    }
});

/**
 * @name upload
 * @description Multer middleware for handling avatar image uploads
 *              using Cloudinary storage.
 */
const upload = multer({ storage });

export default upload;