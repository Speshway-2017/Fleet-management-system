import express from 'express';
import {
  createManager,
  getDashboard,
  getManagerDetails,
  listManagers,
  createOrganization,
  listOrganizations,
  getOrganizationDetails,
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
  listBlogsAdmin,
  createBlogAdmin,
  updateBlogAdmin,
  deleteBlogAdmin,
  getAboutAdmin,
  updateAboutAdmin,
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import memoryUpload from '../middleware/memoryUpload.middleware.js';
import {
  createOrganizationValidator,
  updateOrganizationValidator,
  createManagerValidator,
  updateManagerValidator,
  updateSettingsValidator
} from '../middleware/admin.validator.js';
import {
  listContactRequests,
  getContactAnalytics,
  updateContactRequestStatus,
  replyToContactRequest,
  deleteContactRequest,
  exportContactsCSV
} from '../controllers/admin.contact.controller.js';

const router = express.Router();
const adminAuth = [protect, authorizeRoles('SUPER_ADMIN')];

// ── Dashboard ──────────────────────────────────────────────────────────────
router.get('/dashboard', ...adminAuth, getDashboard);

const parseManagers = (req, res, next) => {
  if (req.body.managers && typeof req.body.managers === 'string') {
    try { req.body.managers = JSON.parse(req.body.managers); } catch(e) {}
  }
  next();
};

// ── Organizations ──────────────────────────────────────────────────────────
router.get('/organizations',       ...adminAuth, listOrganizations);
router.get('/organizations/:id',   ...adminAuth, getOrganizationDetails);
router.post('/organizations',      ...adminAuth, memoryUpload.single('logo'), parseManagers, createOrganizationValidator, createOrganization);
router.put('/organizations/:id',   ...adminAuth, memoryUpload.single('logo'), updateOrganizationValidator, updateOrganization);
router.delete('/organizations/:id',...adminAuth, deleteOrganization);

// ── Fleet Managers ─────────────────────────────────────────────────────────
router.get('/fleet-managers',          ...adminAuth, listManagers);
router.post('/fleet-managers',         ...adminAuth, createManagerValidator, createManager);
router.get('/fleet-managers/:id',      ...adminAuth, getManagerDetails);
router.put('/fleet-managers/:id',      ...adminAuth, updateManagerValidator, updateManager);
router.delete('/fleet-managers/:id',   ...adminAuth, deleteManager);

// ── Settings ───────────────────────────────────────────────────────────────
router.get('/settings',  ...adminAuth, getSettings);
router.put('/settings',  ...adminAuth, memoryUpload.single('logo'), updateSettingsValidator, updateSettings);
router.get('/blogs',     ...adminAuth, listBlogsAdmin);
router.post('/blogs',    ...adminAuth, createBlogAdmin);
router.put('/blogs/:id', ...adminAuth, updateBlogAdmin);
router.delete('/blogs/:id', ...adminAuth, deleteBlogAdmin);
router.get('/about',     ...adminAuth, getAboutAdmin);
router.put('/about',     ...adminAuth, updateAboutAdmin);

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

// ── Contact Requests ───────────────────────────────────────────────────────
router.get('/contacts',                  ...adminAuth, listContactRequests);
router.get('/contacts/analytics',        ...adminAuth, getContactAnalytics);
router.get('/contacts/export',           ...adminAuth, exportContactsCSV);
router.patch('/contacts/:id/status',     ...adminAuth, updateContactRequestStatus);
router.post('/contacts/:id/reply',       ...adminAuth, replyToContactRequest);
router.delete('/contacts/:id',           ...adminAuth, deleteContactRequest);

// ── Profile ────────────────────────────────────────────────────────────────
router.get('/profile',  ...adminAuth, getAdminProfile);
router.put('/profile',  ...adminAuth, memoryUpload.single('profileImage'), updateAdminProfile);

// ── Milestone Reviews ──────────────────────────────────────────────────────
router.get('/reviews',  ...adminAuth, getReviews);
router.patch('/reviews/:id/public', ...adminAuth, toggleReviewPublic);

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

// ── inline GET /reviews controller (lightweight) ─────────────────────────
async function getReviews(req, res, next) {
  try {
    const Review = (await import('../models/Review.js')).default;
    const { sendSuccess } = await import('../utils/response.js');
    const reviews = await Review.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, reviews, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
}

// ── inline PATCH /reviews/:id/public controller (lightweight) ─────────────
async function toggleReviewPublic(req, res, next) {
  try {
    const Review = (await import('../models/Review.js')).default;
    const { sendSuccess, sendError } = await import('../utils/response.js');
    const { showPublic } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { showPublic: !!showPublic },
      { new: true }
    );
    if (!review) return sendError(res, 404, 'Review not found');
    return sendSuccess(res, 200, review, 'Review visibility updated');
  } catch (error) {
    next(error);
  }
}
