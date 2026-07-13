import express from 'express';
import {
  createManager,
  getDashboard,
  getManagerDetails,
  listManagers,
  createOrganization,
  listOrganizations,
  updateOrganization,
  deleteOrganization,
  updateManager,
  deleteManager,
  getSettings,
  updateSettings,
  getAnalytics,
  createIssue,
  listIssues,
  updateIssue,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  updateAdminProfile,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();
const adminAuth = [protect, authorizeRoles('SUPER_ADMIN')];

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', ...adminAuth, getDashboard);

// ── Organizations ──────────────────────────────────────────────────────────
router.get('/organizations',       ...adminAuth, listOrganizations);
router.post('/organizations',      ...adminAuth, createOrganization);
router.put('/organizations/:id',   ...adminAuth, updateOrganization);
router.delete('/organizations/:id',...adminAuth, deleteOrganization);

// ── Fleet Managers ─────────────────────────────────────────────────────────
router.get('/fleet-managers',          ...adminAuth, listManagers);
router.post('/fleet-managers',         ...adminAuth, createManager);
router.get('/fleet-managers/:id',      ...adminAuth, getManagerDetails);
router.put('/fleet-managers/:id',      ...adminAuth, updateManager);
router.delete('/fleet-managers/:id',   ...adminAuth, deleteManager);

// ── Settings ───────────────────────────────────────────────────────────────
router.get('/settings',  ...adminAuth, getSettings);
router.put('/settings',  ...adminAuth, updateSettings);

// ── Analytics ──────────────────────────────────────────────────────────────
router.get('/analytics', ...adminAuth, getAnalytics);

// ── Platform Issues ────────────────────────────────────────────────────────
router.post('/issues',        ...adminAuth, createIssue);
router.get('/issues',         ...adminAuth, listIssues);
router.patch('/issues/:id',   ...adminAuth, updateIssue);

// ── Notifications ──────────────────────────────────────────────────────────
// IMPORTANT: static routes BEFORE /:id to avoid param collision
router.get('/notifications',                   ...adminAuth, getNotifications);
router.patch('/notifications/read-all',        ...adminAuth, markAllNotificationsRead);
router.patch('/notifications/:id/read',        ...adminAuth, markNotificationRead);
router.put('/notifications/:id/read',          ...adminAuth, markNotificationRead);
router.delete('/notifications/:id',            ...adminAuth, deleteNotification);

// ── Profile ────────────────────────────────────────────────────────────────
router.get('/profile',  ...adminAuth, getAdminProfile);
router.put('/profile',  ...adminAuth, updateAdminProfile);

export default router;

// ── inline GET /profile controller (lightweight) ─────────────────────────
async function getAdminProfile(req, res, next) {
  try {
    const User = (await import('../models/User.js')).default;
    const { sendSuccess, sendError } = await import('../utils/response.js');
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return sendError(res, 404, 'Admin user not found');
    return sendSuccess(res, 200, user, 'Profile fetched');
  } catch (error) {
    next(error);
  }
}
