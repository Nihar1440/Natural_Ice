// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'natural_ice',
    allowed_formats: ['jpeg', 'png', 'jpg','webp'],
  },
});

const storageAvatar = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'natural_ice/avatars',
    allowed_formats: ['jpeg', 'png', 'jpg','webp'],
  },
});

const storageReturnOrder = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'natural_ice/return-order',
    allowed_formats: ['jpeg', 'png', 'jpg','webp'],
  },
});

export { cloudinary, storage, storageAvatar, storageReturnOrder };
