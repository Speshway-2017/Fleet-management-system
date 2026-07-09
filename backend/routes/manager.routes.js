import express from 'express';
import { createVehicle, getDashboard, listVehicles } from '../controllers/manager.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('FLEET_MANAGER'), getDashboard);
router.get('/vehicles', protect, authorizeRoles('FLEET_MANAGER'), listVehicles);
router.post('/vehicles', protect, authorizeRoles('FLEET_MANAGER'), createVehicle);

export default router;
