import express from 'express';
import {
  loginDriver,
  logoutDriver,
  getDriverProfile,
  getCurrentTrip,
  getDriverDashboard,
  getDriverNotifications,
  updateTripStatus,
  updateDriverLocation,
  getDriverDocuments,
  getDriverDocumentById,
  getDriverSupportInfo,
  uploadProofOfDelivery,
} from '../controllers/driverApi.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import memoryUpload from '../middleware/memoryUpload.middleware.js';

const router = express.Router();

// Public routes
router.post('/login', loginDriver);
router.post('/logout', logoutDriver);

// Protected routes (require Driver token)
router.use(protect);

router.get('/profile', getDriverProfile);
router.get('/trips/current', getCurrentTrip);
router.get('/dashboard', getDriverDashboard);
router.get('/notifications', getDriverNotifications);
router.patch('/trips/:id/status', updateTripStatus);
router.post('/location', updateDriverLocation);
router.get('/documents', getDriverDocuments);
router.get('/documents/:id', getDriverDocumentById);
router.get('/support', getDriverSupportInfo);

router.post('/pod', (req, res, next) => {
  memoryUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadProofOfDelivery);

export default router;
