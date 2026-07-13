import express from 'express';
import {
  getDashboard,
  getLiveTracking,
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
  deleteNotification
  // E-Way Bills
  listEWayBills,
  createEWayBill,
  extendEWayBill,
  updateEWayBill,
  deleteEWayBill
} from '../controllers/manager.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

const auth = [protect, authorizeRoles('FLEET_MANAGER')];

// Dashboard
router.get('/dashboard',       ...auth, getDashboard);
router.get('/live-tracking',   ...auth, getLiveTracking);

// Vehicles
router.get('/vehicles',        ...auth, listVehicles);
router.post('/vehicles',       ...auth, createVehicle);
router.get('/vehicles/:id',    ...auth, getVehicleById);
router.put('/vehicles/:id',    ...auth, updateVehicle);
router.delete('/vehicles/:id', ...auth, deleteVehicle);

// Drivers
router.get('/drivers',        ...auth, listDrivers);
router.post('/drivers',       ...auth, createDriver);
router.get('/drivers/:id',    ...auth, getDriverDetails);
router.put('/drivers/:id',    ...auth, updateDriver);
router.delete('/drivers/:id', ...auth, deleteDriver);

// Trips
router.get('/trips',        ...auth, listTrips);
router.post('/trips',       ...auth, createTrip);
router.get('/trips/:id',    ...auth, getTripDetails);
router.put('/trips/:id',    ...auth, updateTrip);
router.delete('/trips/:id', ...auth, deleteTrip);

// Fuel
router.get('/fuel',        ...auth, listFuelRecords);
router.post('/fuel',       ...auth, createFuelRecord);
router.get('/fuel/:id',    ...auth, getFuelRecordDetails);
router.put('/fuel/:id',    ...auth, updateFuelRecord);
router.delete('/fuel/:id', ...auth, deleteFuelRecord);

// Maintenance
router.get('/maintenance',        ...auth, listMaintenance);
router.post('/maintenance',       ...auth, createMaintenance);
router.get('/maintenance/:id',    ...auth, getMaintenanceDetails);
router.put('/maintenance/:id',    ...auth, updateMaintenance);
router.delete('/maintenance/:id', ...auth, deleteMaintenance);

// Documents
router.get('/documents',        ...auth, listDocuments);
router.post('/documents',       ...auth, createDocument);
router.get('/documents/:id',    ...auth, getDocumentDetails);
router.put('/documents/:id',    ...auth, updateDocument);
router.delete('/documents/:id', ...auth, deleteDocument);

// Reports
router.get('/reports',        ...auth, listReports);
router.post('/reports',       ...auth, createReport);
router.get('/reports/:id',    ...auth, getReportDetails);
router.put('/reports/:id',    ...auth, updateReport);
router.delete('/reports/:id', ...auth, deleteReport);

// Notifications
router.get('/notifications',         ...auth, listNotifications);
router.patch('/notifications/read-all', ...auth, markAllNotificationsRead);
router.patch('/notifications/:id/read', ...auth, markNotificationRead);
router.put('/notifications/:id/read', ...auth, markNotificationRead);
router.delete('/notifications/:id', ...auth, deleteNotification);
// E-Way Bills
router.get('/eway',            ...auth, listEWayBills);
router.post('/eway',           ...auth, createEWayBill);
router.put('/eway/:id/extend', ...auth, extendEWayBill);
router.put('/eway/:id',        ...auth, updateEWayBill);
router.delete('/eway/:id',     ...auth, deleteEWayBill);

export default router;
