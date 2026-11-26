import multer from 'multer';
import path from 'path';

// Use memory storage to process files directly into Cloudinary without writing to disk
const storage = multer.memoryStorage();

// File filter to allow images, PDFs, Word, Excel, and Text files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, Word, Excel, and Text documents are allowed'), false);
  }
};

const memoryUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
  },
});

export default memoryUpload;
