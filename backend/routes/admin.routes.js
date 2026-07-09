import express from 'express';
import { createManager, getDashboard, getManagerDetails, listManagers, createOrganization, listOrganizations, getAnalytics, getSystemHealth, getAuditLogs } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('SUPER_ADMIN'), getDashboard);
router.get('/organizations', protect, authorizeRoles('SUPER_ADMIN'), listOrganizations);
router.post('/organizations', protect, authorizeRoles('SUPER_ADMIN'), createOrganization);
router.get('/fleet-managers', protect, authorizeRoles('SUPER_ADMIN'), listManagers);
router.post('/fleet-managers', protect, authorizeRoles('SUPER_ADMIN'), createManager);
router.get('/fleet-managers/:id', protect, authorizeRoles('SUPER_ADMIN'), getManagerDetails);
router.get('/analytics', protect, authorizeRoles('SUPER_ADMIN'), getAnalytics);
router.get('/health', protect, authorizeRoles('SUPER_ADMIN'), getSystemHealth);
router.get('/audit-logs', protect, authorizeRoles('SUPER_ADMIN'), getAuditLogs);

export default router;
