import express from 'express';
import {
  getDashboard,
  getLiveTracking,
  listActivities,
  // Vehicles
  listVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  // Drivers
  listDrivers,
  createDriver,
  getDriverDetails,
  updateDriver,
  deleteDriver,
  // Trips
  listTrips,
  createTrip,
  getTripDetails,
  updateTrip,
  deleteTrip,
  getInvoiceByTripId,
  // Fuel
  listFuelRecords,
  createFuelRecord,
  getFuelRecordDetails,
  updateFuelRecord,
  deleteFuelRecord,
  // Maintenance
  listMaintenance,
  createMaintenance,
  getMaintenanceDetails,
  updateMaintenance,
  deleteMaintenance,
  // Documents
  listDocuments,
  createDocument,
  getDocumentDetails,
  updateDocument,
  deleteDocument,
  // Reports
  listReports,
  createReport,
  getReportDetails,
  updateReport,
  deleteReport,
  // Notifications
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  // E-Way Bills
  listEWayBills,
  createEWayBill,
  extendEWayBill,
  updateEWayBill,
  deleteEWayBill,
  // Milestone Reviews
  getPendingMilestone,
  submitReview,
  maybeLater,
  getEarnings,
  getPODByTripId,
  updatePODStatus,
  getWeighbridgeSlipByTripId,
  updateWeighbridgeSlipStatus,
  getTripTolls,
  createVehicleComplaint,
  listVehicleComplaints,
  updateVehicleComplaint
} from '../controllers/manager.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { checkActiveSubscription } from '../middleware/subscription.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

// Dashboard

router.get('/dashboard', ...auth, getDashboard);
router.get('/live-tracking', ...auth, getLiveTracking);
router.get('/activities', ...auth, listActivities);
router.get('/earnings', ...auth, getEarnings);

// Vehicles
router.get('/vehicles', ...auth, listVehicles);
router.post('/vehicles', ...auth, checkActiveSubscription, createVehicle);
router.get('/vehicles/:id', ...auth, getVehicleById);
router.put('/vehicles/:id', ...auth, checkActiveSubscription, updateVehicle);
router.delete('/vehicles/:id', ...auth, checkActiveSubscription, deleteVehicle);

// Drivers
router.get('/drivers', ...auth, listDrivers);
router.post('/drivers', ...auth, checkActiveSubscription, createDriver);
router.get('/drivers/:id', ...auth, getDriverDetails);
router.put('/drivers/:id', ...auth, checkActiveSubscription, updateDriver);
router.delete('/drivers/:id', ...auth, checkActiveSubscription, deleteDriver);

// Trips
router.get('/trips', ...auth, listTrips);
router.post('/trips', ...auth, checkActiveSubscription, createTrip);
router.get('/trips/:id', ...auth, getTripDetails);
router.get('/trips/:tripId/tolls', ...auth, getTripTolls);
router.put('/trips/:id', ...auth, checkActiveSubscription, updateTrip);
router.delete('/trips/:id', ...auth, checkActiveSubscription, deleteTrip);

// Fuel
router.get('/fuel', ...auth, listFuelRecords);
router.post('/fuel', ...auth, checkActiveSubscription, createFuelRecord);
router.get('/fuel/:id', ...auth, getFuelRecordDetails);
router.put('/fuel/:id', ...auth, checkActiveSubscription, updateFuelRecord);
router.delete('/fuel/:id', ...auth, checkActiveSubscription, deleteFuelRecord);

// Maintenance
router.get('/maintenance', ...auth, listMaintenance);
router.post('/maintenance', ...auth, checkActiveSubscription, createMaintenance);
router.get('/maintenance/:id', ...auth, getMaintenanceDetails);
router.put('/maintenance/:id', ...auth, checkActiveSubscription, updateMaintenance);
router.delete('/maintenance/:id', ...auth, checkActiveSubscription, deleteMaintenance);

// Documents
router.get('/documents', ...auth, listDocuments);
router.post('/documents', ...auth, checkActiveSubscription, createDocument);
router.get('/documents/:id', ...auth, getDocumentDetails);
router.put('/documents/:id', ...auth, checkActiveSubscription, updateDocument);
router.delete('/documents/:id', ...auth, checkActiveSubscription, deleteDocument);

// Reports
router.get('/reports', ...auth, listReports);
router.post('/reports', ...auth, checkActiveSubscription, createReport);
router.get('/reports/:id', ...auth, getReportDetails);
router.put('/reports/:id', ...auth, checkActiveSubscription, updateReport);
router.delete('/reports/:id', ...auth, checkActiveSubscription, deleteReport);

// Notifications
router.get('/notifications', ...auth, listNotifications);
router.patch('/notifications/read-all', ...auth, markAllNotificationsRead);
router.patch('/notifications/:id/read', ...auth, markNotificationRead);
router.put('/notifications/:id/read', ...auth, markNotificationRead);
router.delete('/notifications/:id', ...auth, deleteNotification);
// E-Way Bills
router.get('/eway', ...auth, listEWayBills);
router.post('/eway', ...auth, checkActiveSubscription, createEWayBill);
router.put('/eway/:id/extend', ...auth, checkActiveSubscription, extendEWayBill);
router.put('/eway/:id', ...auth, checkActiveSubscription, updateEWayBill);
// Invoices
router.get('/invoices/trip/:tripId', ...auth, getInvoiceByTripId);
router.get('/invoices/trip/:tripId/download', ...auth, getInvoiceByTripId);
router.get('/invoices/trip/:tripId/print', ...auth, getInvoiceByTripId);

// Trip Milestone Reviews
router.get('/reviews/pending-milestone', ...auth, getPendingMilestone);
router.post('/reviews', ...auth, submitReview);
router.post('/reviews/maybe-later', ...auth, maybeLater);

// Proof of Delivery (POD)
router.get('/pod/trip/:tripId', ...auth, getPODByTripId);
router.put('/pod/:id/status', ...auth, updatePODStatus);

// Weighbridge Slip
router.get('/weighbridge/trip/:tripId', ...auth, getWeighbridgeSlipByTripId);
router.put('/weighbridge/:id/status', ...auth, updateWeighbridgeSlipStatus);
// Vehicle Complaints (Simulated Driver Tickets)
router.post('/vehicle-complaints', ...auth, createVehicleComplaint);
router.get('/vehicle-complaints', ...auth, listVehicleComplaints);
router.put('/vehicle-complaints/:id', ...auth, updateVehicleComplaint);

export default router;
