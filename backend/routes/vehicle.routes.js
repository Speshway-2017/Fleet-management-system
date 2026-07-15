import express from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAvailableVehicles,
  checkVehicleDuplicate,
} from '../controllers/vehicle.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

router.get('/available',        ...auth, getAvailableVehicles);
router.get('/check-duplicate',  ...auth, checkVehicleDuplicate);
router.get('/',                 ...auth, listVehicles);
router.post('/',                ...auth, createVehicle);
router.get('/:id',              ...auth, getVehicle);
router.put('/:id',              ...auth, updateVehicle);
router.delete('/:id',           ...auth, deleteVehicle);

export default router;
