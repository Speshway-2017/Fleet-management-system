import express from 'express';
import {
  createVehicle,
  getDashboard,
  listVehicles,
  getVehicleDetails,
  updateVehicle,
  deleteVehicle,
  listDrivers,
  getDriverDetails,
  createDriver,
  updateDriver,
  deleteDriver,
  listTrips,
  getTripDetails,
  createTrip,
  updateTrip,
  deleteTrip,
  listFuelRecords,
  getFuelRecordDetails,
  createFuelRecord,
  updateFuelRecord,
  deleteFuelRecord,
  listMaintenance,
  getMaintenanceDetails,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  listDocuments,
  getDocumentDetails,
  createDocument,
  updateDocument,
  deleteDocument,
  listReports,
  getReportDetails,
  createReport,
  updateReport,
  deleteReport
} from '../controllers/manager.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorizeRoles('FLEET_MANAGER'), getDashboard);

// Vehicles routes
router.get('/vehicles', protect, authorizeRoles('FLEET_MANAGER'), listVehicles);
router.get('/vehicles/:id', protect, authorizeRoles('FLEET_MANAGER'), getVehicleDetails);
router.post('/vehicles', protect, authorizeRoles('FLEET_MANAGER'), createVehicle);
router.put('/vehicles/:id', protect, authorizeRoles('FLEET_MANAGER'), updateVehicle);
router.delete('/vehicles/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteVehicle);

// Drivers routes
router.get('/drivers', protect, authorizeRoles('FLEET_MANAGER'), listDrivers);
router.get('/drivers/:id', protect, authorizeRoles('FLEET_MANAGER'), getDriverDetails);
router.post('/drivers', protect, authorizeRoles('FLEET_MANAGER'), createDriver);
router.put('/drivers/:id', protect, authorizeRoles('FLEET_MANAGER'), updateDriver);
router.delete('/drivers/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteDriver);

// Trips routes
router.get('/trips', protect, authorizeRoles('FLEET_MANAGER'), listTrips);
router.get('/trips/:id', protect, authorizeRoles('FLEET_MANAGER'), getTripDetails);
router.post('/trips', protect, authorizeRoles('FLEET_MANAGER'), createTrip);
router.put('/trips/:id', protect, authorizeRoles('FLEET_MANAGER'), updateTrip);
router.delete('/trips/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteTrip);

// Fuel routes
router.get('/fuel', protect, authorizeRoles('FLEET_MANAGER'), listFuelRecords);
router.get('/fuel/:id', protect, authorizeRoles('FLEET_MANAGER'), getFuelRecordDetails);
router.post('/fuel', protect, authorizeRoles('FLEET_MANAGER'), createFuelRecord);
router.put('/fuel/:id', protect, authorizeRoles('FLEET_MANAGER'), updateFuelRecord);
router.delete('/fuel/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteFuelRecord);

// Maintenance routes
router.get('/maintenance', protect, authorizeRoles('FLEET_MANAGER'), listMaintenance);
router.get('/maintenance/:id', protect, authorizeRoles('FLEET_MANAGER'), getMaintenanceDetails);
router.post('/maintenance', protect, authorizeRoles('FLEET_MANAGER'), createMaintenance);
router.put('/maintenance/:id', protect, authorizeRoles('FLEET_MANAGER'), updateMaintenance);
router.delete('/maintenance/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteMaintenance);

// Documents routes
router.get('/documents', protect, authorizeRoles('FLEET_MANAGER'), listDocuments);
router.get('/documents/:id', protect, authorizeRoles('FLEET_MANAGER'), getDocumentDetails);
router.post('/documents', protect, authorizeRoles('FLEET_MANAGER'), createDocument);
router.put('/documents/:id', protect, authorizeRoles('FLEET_MANAGER'), updateDocument);
router.delete('/documents/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteDocument);

// Reports routes
router.get('/reports', protect, authorizeRoles('FLEET_MANAGER'), listReports);
router.get('/reports/:id', protect, authorizeRoles('FLEET_MANAGER'), getReportDetails);
router.post('/reports', protect, authorizeRoles('FLEET_MANAGER'), createReport);
router.put('/reports/:id', protect, authorizeRoles('FLEET_MANAGER'), updateReport);
router.delete('/reports/:id', protect, authorizeRoles('FLEET_MANAGER'), deleteReport);

export default router;
