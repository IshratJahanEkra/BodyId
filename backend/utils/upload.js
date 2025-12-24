// backend/utils/upload.js
import multer, { memoryStorage } from 'multer';
import streamifier from 'streamifier';
import cloudinary from '../utils/cloudinary.js'; // .js extension is required

// multer memory storage
const storage = memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export { upload, uploadToCloudinary };
