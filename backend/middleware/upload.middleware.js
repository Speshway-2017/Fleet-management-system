import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.config.js';

// ── Cloudinary storage — uploads go to the fleet_management folder ─────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const isImage = file.mimetype.startsWith('image/');
    return {
      folder:        'fleet_management',
      resource_type: isImage ? 'image' : 'raw',
      public_id:     `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
    };
  },
});

// Memory storage — for in-memory processing (OCR etc.)
const memoryStorage = multer.memoryStorage();

const upload         = multer({ storage: cloudinaryStorage }); // default
const uploadInMemory = multer({ storage: memoryStorage });     // in-memory variant

export default upload;
export { uploadInMemory };
