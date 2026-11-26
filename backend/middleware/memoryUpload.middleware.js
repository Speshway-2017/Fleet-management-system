import multer from 'multer';
import path from 'path';
import { isAllowedExtensionAndMime, sanitizeFilename, validateFileMagicBytes } from '../utils/fileSecurity.js';
import { recordSecurityEvent } from '../services/securityMonitor.service.js';

// Use memory storage to process files directly into Cloudinary without writing to disk
const storage = multer.memoryStorage();

// Strict file filter requiring both allowed extension and matching MIME (no SVG/scripts/executables)
const fileFilter = (req, file, cb) => {
  const check = isAllowedExtensionAndMime(file.originalname, file.mimetype);
  if (check.valid) {
    cb(null, true);
  } else {
    req._uploadRejectionReason = check.reason;
    cb(new Error(check.reason || 'Only safe images, PDFs, Word, Excel, and Text documents are allowed'), false);
  }
};

const rawUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit to 10MB
    files: 5,
  },
});

const verifyBufferedUploads = async (req) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) files.push(...req.files);
  else if (req.files && typeof req.files === 'object') {
    Object.values(req.files).forEach((arr) => {
      if (Array.isArray(arr)) files.push(...arr);
    });
  }

  for (const file of files) {
    file.originalname = sanitizeFilename(file.originalname);
    const ext = path.extname(file.originalname).toLowerCase();
    const sigCheck = validateFileMagicBytes(file.buffer, ext);
    if (!sigCheck.valid) {
      await recordSecurityEvent({
        category: 'MALICIOUS_UPLOAD',
        severity: 'High',
        status: 'Blocked',
        req,
        reason: sigCheck.reason,
        details: { filename: file.originalname, mimetype: file.mimetype, size: file.size },
      });
      throw new Error(sigCheck.reason);
    }
  }
};

const wrapMulterHandler = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err) {
      await recordSecurityEvent({
        category: 'MALICIOUS_UPLOAD',
        severity: 'High',
        status: 'Blocked',
        req,
        reason: err.message || req._uploadRejectionReason || 'Malicious or invalid upload rejected',
      });
      return next(err);
    }
    try {
      await verifyBufferedUploads(req);
      return next();
    } catch (verifyErr) {
      return next(verifyErr);
    }
  });
};

const memoryUpload = {
  single: (fieldName) => wrapMulterHandler(rawUpload.single(fieldName)),
  array: (fieldName, maxCount) => wrapMulterHandler(rawUpload.array(fieldName, maxCount)),
  fields: (fields) => wrapMulterHandler(rawUpload.fields(fields)),
  any: () => wrapMulterHandler(rawUpload.any()),
};

export default memoryUpload;
