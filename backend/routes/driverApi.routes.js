import express from 'express';
import {
  loginDriver,
  logoutDriver,
  getDriverProfile,
  updateDriverProfile,
  getCurrentTrip,
  getDriverDashboard,
  getDriverNotifications,
  respondToTripAssignment,
  acceptTrip,
  rejectTrip,
  markDriverNotificationRead,
  markAllDriverNotificationsRead,
  updateTripStatus,
  endTrip,
  toggleCustomerLocation,
  updateDriverLocation,
  getDriverDocuments,
  getDriverDocumentById,
  getDriverSupportInfo,
  uploadProofOfDelivery,
  uploadWeighbridgeSlip,
  getDriverTrips,
  getDriverTripById,
  getDriverTripTolls,
  getAssignedVehicle,
  getDriverMaintenance,
  createDriverFuelEntry,
  getDriverFuelRecords,
  createDriverTollTransaction,
  createDriverTicket,
  getDriverTickets,
  getDriverTicketById,
  updateDriverTicketStatus,
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
router.put('/profile', updateDriverProfile);
router.get('/vehicle', getAssignedVehicle);
router.get('/maintenance', getDriverMaintenance);
router.get('/trips/current', getCurrentTrip);
router.get('/trips', getDriverTrips);
router.get('/trips/:id', getDriverTripById);
router.get('/trips/:id/tolls', getDriverTripTolls);
router.get('/dashboard', getDriverDashboard);
router.get('/notifications', getDriverNotifications);
router.patch('/trips/:id/respond', respondToTripAssignment);
router.post('/trips/:id/respond', respondToTripAssignment);
router.post('/trips/:id/accept', acceptTrip);
router.post('/trips/:id/reject', rejectTrip);
router.patch('/notifications/read-all', markAllDriverNotificationsRead);
router.patch('/trips/:id/status', updateTripStatus);
router.patch('/trips/:id/end-trip', endTrip);
router.post('/trips/:id/end-trip', endTrip);
router.put('/trips/:id/end-trip', endTrip);
router.patch('/trips/:id/end', endTrip);
router.post('/trips/:id/end', endTrip);
router.put('/trips/:id/end', endTrip);
router.patch('/trips/:id/customer-location', toggleCustomerLocation);
router.post('/trips/:id/customer-location', toggleCustomerLocation);
router.post('/location', updateDriverLocation);
router.get('/documents', getDriverDocuments);
router.get('/documents/:id', getDriverDocumentById);
router.get('/support', getDriverSupportInfo);

router.get('/fuel', getDriverFuelRecords);
router.post('/fuel', (req, res, next) => {
  memoryUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, createDriverFuelEntry);

router.post('/pod', (req, res, next) => {
  memoryUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadProofOfDelivery);

router.post('/weighbridge', (req, res, next) => {
  memoryUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadWeighbridgeSlip);

router.post('/tolls', (req, res, next) => {
  memoryUpload.array('files', 5)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, createDriverTollTransaction);

router.get('/tickets', getDriverTickets);
router.get('/tickets/:id', getDriverTicketById);
router.patch('/tickets/:id/status', updateDriverTicketStatus);
router.post('/tickets', (req, res, next) => {
  memoryUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, createDriverTicket);

export default router;
