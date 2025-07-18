import multer from 'multer';
import { storage, storageAvatar } from '../utils/cloudinary.js';

const upload = multer({ storage });
const uploadAvatar = multer({ storage: storageAvatar });

export default upload;
export { uploadAvatar };