import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isAllowedExtensionAndMime, sanitizeFilename, validateFileMagicBytes } from '../utils/fileSecurity.js';
import { recordSecurityEvent } from '../services/securityMonitor.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists at runtime
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(sanitizeFilename(file.originalname)).toLowerCase();
    cb(null, `driver-doc-${uniqueSuffix}${ext}`);
  },
});

const DISK_ALLOWED_EXTS = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const check = isAllowedExtensionAndMime(file.originalname, file.mimetype, DISK_ALLOWED_EXTS);
  if (check.valid) {
    cb(null, true);
  } else {
    req._uploadRejectionReason = check.reason;
    cb(new Error(check.reason || 'Only PDF, JPG, and PNG files are allowed'), false);
  }
};

const rawSingleUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
}).single('document');

/**
 * Named export: single-file upload for driver documents with magic-byte validation.
 * Field name expected: "document"
 */
export const uploadDocument = (req, res, next) => {
  rawSingleUpload(req, res, async (err) => {
    if (err) {
      await recordSecurityEvent({
        category: 'MALICIOUS_UPLOAD',
        severity: 'High',
        status: 'Blocked',
        req,
        reason: err.message || req._uploadRejectionReason || 'Rejected invalid document upload',
      });
      return next(err);
    }
    if (req.file?.path) {
      try {
        const fd = fs.openSync(req.file.path, 'r');
        const head = Buffer.alloc(1024);
        const bytesRead = fs.readSync(fd, head, 0, 1024, 0);
        fs.closeSync(fd);
        const ext = path.extname(req.file.filename).toLowerCase();
        const sigCheck = validateFileMagicBytes(head.subarray(0, bytesRead), ext);
        if (!sigCheck.valid) {
          fs.unlinkSync(req.file.path);
          await recordSecurityEvent({
            category: 'MALICIOUS_UPLOAD',
            severity: 'High',
            status: 'Blocked',
            req,
            reason: sigCheck.reason,
            details: { filename: sanitizeFilename(req.file.originalname), mimetype: req.file.mimetype },
          });
          return next(new Error(sigCheck.reason));
        }
      } catch (readErr) {
        return next(readErr);
      }
    }
    return next();
  });
};

/** Default export for backward compatibility */
export default multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
