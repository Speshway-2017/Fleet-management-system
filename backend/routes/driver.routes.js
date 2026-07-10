import express from 'express';
import {
  listDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  uploadDriverDocument,
  getAvailableDrivers,
} from '../controllers/driver.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { uploadDocument } from '../middleware/upload.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

router.get('/available', ...auth, getAvailableDrivers);
router.get('/',    ...auth, listDrivers);
router.post('/',   ...auth, createDriver);

// IMPORTANT: /upload-document must come BEFORE /:id
// so Express does not interpret "upload-document" as a driver ID
router.post('/upload-document', ...auth, (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadDriverDocument);

router.get('/:id',    ...auth, getDriver);
router.put('/:id',    ...auth, updateDriver);
router.delete('/:id', ...auth, deleteDriver);

export default router;
