import path from 'path';

/**
 * Strict extension -> allowed MIME type mapping (no SVG/HTML/JS/executable uploads).
 */
export const ALLOWED_FILE_MIME_MAP = Object.freeze({
  '.png': ['image/png'],
  '.jpg': ['image/jpeg', 'image/pjpeg'],
  '.jpeg': ['image/jpeg', 'image/pjpeg'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.pdf': ['application/pdf'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.txt': ['text/plain'],
});

const DANGEROUS_DOUBLE_EXT_RE = /\.(php\d*|phtml|exe|dll|bat|cmd|sh|ps1|js|mjs|cjs|vbs|html?|svg|jsp|asp|aspx)(\.|$)/i;

export const sanitizeFilename = (originalname = 'file') => {
  const withoutControls = Array.from(path.basename(String(originalname || 'file')))
    .map((ch) => (ch.charCodeAt(0) < 32 ? '_' : ch))
    .join('');
  const base = withoutControls.replace(/[<>:"/\\|?*]/g, '_');
  return base.slice(0, 140) || 'file';
};

export const isAllowedExtensionAndMime = (originalname, mimetype, allowedExts = Object.keys(ALLOWED_FILE_MIME_MAP)) => {
  const safeName = sanitizeFilename(originalname);
  if (DANGEROUS_DOUBLE_EXT_RE.test(safeName)) {
    return { valid: false, reason: 'Potentially dangerous or executable file extension detected' };
  }

  const ext = path.extname(safeName).toLowerCase();
  if (!ext || !allowedExts.includes(ext)) {
    return { valid: false, reason: `Unsupported file extension (${ext || 'none'})` };
  }

  const cleanMime = String(mimetype || '').toLowerCase().split(';')[0].trim();
  const allowedMimes = ALLOWED_FILE_MIME_MAP[ext] || [];
  // Mobile multipart libraries sometimes send application/octet-stream when uploading by path;
  // magic-byte inspection below still strictly verifies binary file contents.
  if (cleanMime && cleanMime !== 'application/octet-stream' && !allowedMimes.includes(cleanMime)) {
    return { valid: false, reason: `MIME type "${cleanMime}" does not match extension "${ext}"` };
  }

  return { valid: true, ext };
};

export const validateFileMagicBytes = (buffer, ext) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { valid: false, reason: 'Empty file buffer rejected' };
  }

  const hex = buffer.subarray(0, 16).toString('hex');

  switch (ext) {
    case '.png':
      return hex.startsWith('89504e470d0a1a0a')
        ? { valid: true }
        : { valid: false, reason: 'Invalid PNG file signature' };
    case '.jpg':
    case '.jpeg':
      return hex.startsWith('ffd8ff')
        ? { valid: true }
        : { valid: false, reason: 'Invalid JPEG file signature' };
    case '.gif': {
      const hdr = buffer.subarray(0, 6).toString('ascii');
      return hdr === 'GIF87a' || hdr === 'GIF89a'
        ? { valid: true }
        : { valid: false, reason: 'Invalid GIF file signature' };
    }
    case '.webp': {
      const riff = buffer.subarray(0, 4).toString('ascii');
      const webp = buffer.subarray(8, 12).toString('ascii');
      return riff === 'RIFF' && webp === 'WEBP'
        ? { valid: true }
        : { valid: false, reason: 'Invalid WEBP file signature' };
    }
    case '.pdf': {
      const head = buffer.subarray(0, 1024).toString('latin1');
      return head.includes('%PDF-')
        ? { valid: true }
        : { valid: false, reason: 'Invalid PDF file signature' };
    }
    case '.doc':
    case '.xls':
      return hex.startsWith('d0cf11e0a1b11ae1')
        ? { valid: true }
        : { valid: false, reason: `Invalid legacy Office (${ext}) file signature` };
    case '.docx':
    case '.xlsx':
      return hex.startsWith('504b0304')
        ? { valid: true }
        : { valid: false, reason: `Invalid OOXML (${ext}) archive signature` };
    case '.txt': {
      // Reject binary executables disguised as .txt
      const sample = buffer.subarray(0, Math.min(buffer.length, 512));
      if (sample.includes(0x00)) {
        return { valid: false, reason: 'Binary content rejected in .txt upload' };
      }
      const lower = buffer.subarray(0, Math.min(buffer.length, 2048)).toString('utf8').toLowerCase();
      if (lower.includes('<script') || lower.includes('<?php')) {
        return { valid: false, reason: 'Executable script payload rejected in .txt upload' };
      }
      return { valid: true };
    }
    default:
      return { valid: false, reason: 'Unsupported file signature check' };
  }
};

