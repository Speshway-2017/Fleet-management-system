import express from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
} from '../controllers/vehicle.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { checkActiveSubscription } from '../middleware/subscription.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

router.get('/available', ...auth, getAvailableVehicles);
router.get('/',    ...auth, listVehicles);
router.post('/',   ...auth, checkActiveSubscription, createVehicle);
router.get('/:id', ...auth, getVehicle);
router.put('/:id', ...auth, checkActiveSubscription, updateVehicle);
router.delete('/:id', ...auth, checkActiveSubscription, deleteVehicle);

export default router;
