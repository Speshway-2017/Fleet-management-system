import express from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  uploadVehicleDocument,
} from '../controllers/vehicle.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { uploadDocument } from '../middleware/upload.middleware.js';
import { checkActiveSubscription } from '../middleware/subscription.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

router.get('/available', ...auth, getAvailableVehicles);
router.get('/',    ...auth, listVehicles);
router.post('/',   ...auth, checkActiveSubscription, createVehicle);

// Upload document endpoint for vehicles
router.post('/upload-document', ...auth, checkActiveSubscription, (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadVehicleDocument);

router.get('/:id', ...auth, getVehicle);
router.put('/:id', ...auth, checkActiveSubscription, updateVehicle);
router.delete('/:id', ...auth, checkActiveSubscription, deleteVehicle);

export default router;
