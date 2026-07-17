import multer from "multer";

/**
 * @name upload
 * @description Configures the Multer middleware to store uploaded files in memory
 *              and limits the maximum file size to 3 MB.
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    }
});

export default upload;