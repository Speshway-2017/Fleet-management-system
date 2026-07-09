import express from 'express';
import {
  createVehicle,
  getDashboard,
  listVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from '../controllers/manager.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

router.get('/dashboard',       ...auth, getDashboard);
router.get('/vehicles',        ...auth, listVehicles);
router.post('/vehicles',       ...auth, createVehicle);
router.get('/vehicles/:id',    ...auth, getVehicleById);
router.put('/vehicles/:id',    ...auth, updateVehicle);
router.delete('/vehicles/:id', ...auth, deleteVehicle);

export default router;
