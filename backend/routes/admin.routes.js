import express from 'express';
import { createManager, getDashboard, getManagerDetails, listManagers } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('SUPER_ADMIN'), getDashboard);
router.get('/managers', protect, authorizeRoles('SUPER_ADMIN'), listManagers);
router.post('/managers', protect, authorizeRoles('SUPER_ADMIN'), createManager);
router.get('/managers/:id', protect, authorizeRoles('SUPER_ADMIN'), getManagerDetails);

export default router;
