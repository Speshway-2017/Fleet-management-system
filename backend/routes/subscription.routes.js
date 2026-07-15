import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  getPlans,
  getPublicPlans,
  createPlan,
  updatePlan,
  deletePlan,
  submitRequest,
  getMyRequest,
  listRequests,
  approveRequest,
  rejectRequest
} from '../controllers/subscription.controller.js';

const router = express.Router();

// Public route
router.get('/public/plans', getPublicPlans);

// Protected routes (Any authenticated role can read plans)
router.get('/plans', protect, getPlans);

// Admin-only plans CRUD
router.post('/plans', protect, authorizeRoles('SUPER_ADMIN'), createPlan);
router.put('/plans/:id', protect, authorizeRoles('SUPER_ADMIN'), updatePlan);
router.delete('/plans/:id', protect, authorizeRoles('SUPER_ADMIN'), deletePlan);

// Manager requests
router.post('/requests', protect, authorizeRoles('FLEET_MANAGER'), submitRequest);
router.get('/requests/my', protect, authorizeRoles('FLEET_MANAGER'), getMyRequest);

// Admin requests approval
router.get('/requests', protect, authorizeRoles('SUPER_ADMIN'), listRequests);
router.put('/requests/:id/approve', protect, authorizeRoles('SUPER_ADMIN'), approveRequest);
router.put('/requests/:id/reject', protect, authorizeRoles('SUPER_ADMIN'), rejectRequest);

export default router;
