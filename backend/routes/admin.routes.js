import express from 'express';
import { createManager, getDashboard, getManagerDetails, updateManager, deleteManager, listManagers, createOrganization, getOrganizationDetails, updateOrganization, deleteOrganization, listOrganizations, getAnalytics, getSystemHealth, getAuditLogs, getSettings, updateSettings, getSecuritySettings, updateSecuritySettings, getNotificationSettings, updateNotificationSettings, getProfile, updateProfile } from '../controllers/admin.controller.js';
import { getNotifications, createNotification, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import memoryUpload from '../middleware/memoryUpload.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('SUPER_ADMIN'), getDashboard);
router.get('/organizations', protect, authorizeRoles('SUPER_ADMIN'), listOrganizations);
router.post('/organizations', protect, authorizeRoles('SUPER_ADMIN'), createOrganization);
router.get('/organizations/:id', protect, authorizeRoles('SUPER_ADMIN'), getOrganizationDetails);
router.put('/organizations/:id', protect, authorizeRoles('SUPER_ADMIN'), updateOrganization);
router.delete('/organizations/:id', protect, authorizeRoles('SUPER_ADMIN'), deleteOrganization);

router.get('/fleet-managers', protect, authorizeRoles('SUPER_ADMIN'), listManagers);
router.post('/fleet-managers', protect, authorizeRoles('SUPER_ADMIN'), createManager);
router.get('/fleet-managers/:id', protect, authorizeRoles('SUPER_ADMIN'), getManagerDetails);
router.put('/fleet-managers/:id', protect, authorizeRoles('SUPER_ADMIN'), updateManager);
router.delete('/fleet-managers/:id', protect, authorizeRoles('SUPER_ADMIN'), deleteManager);
router.get('/analytics', protect, authorizeRoles('SUPER_ADMIN'), getAnalytics);
router.get('/health', protect, authorizeRoles('SUPER_ADMIN'), getSystemHealth);
router.get('/audit-logs', protect, authorizeRoles('SUPER_ADMIN'), getAuditLogs);

// Settings Routes
router.get('/settings', protect, authorizeRoles('SUPER_ADMIN'), getSettings);
router.put('/settings', protect, authorizeRoles('SUPER_ADMIN'), memoryUpload.single('logo'), updateSettings);
router.get('/settings/security', protect, authorizeRoles('SUPER_ADMIN'), getSecuritySettings);
router.put('/settings/security', protect, authorizeRoles('SUPER_ADMIN'), updateSecuritySettings);
router.get('/settings/notifications', protect, authorizeRoles('SUPER_ADMIN'), getNotificationSettings);
router.put('/settings/notifications', protect, authorizeRoles('SUPER_ADMIN'), updateNotificationSettings);
router.get('/profile', protect, authorizeRoles('SUPER_ADMIN'), getProfile);
router.put('/profile', protect, authorizeRoles('SUPER_ADMIN'), memoryUpload.single('profileImage'), updateProfile);

// Notification Routes
router.get('/notifications', protect, authorizeRoles('SUPER_ADMIN'), getNotifications);
router.post('/notifications', protect, authorizeRoles('SUPER_ADMIN'), createNotification);
router.patch('/notifications/read-all', protect, authorizeRoles('SUPER_ADMIN'), markAllAsRead);
router.patch('/notifications/:id/read', protect, authorizeRoles('SUPER_ADMIN'), markAsRead);
router.delete('/notifications/:id', protect, authorizeRoles('SUPER_ADMIN'), deleteNotification);

export default router;
