import {
  createVehicle as createVehicleInRepo,
  getVehicles,
  getVehicleById as getVehicleByIdInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
  getDrivers,
  getDriverById,
  createDriver as createDriverInRepo,
  updateDriver as updateDriverInRepo,
  deleteDriver as deleteDriverInRepo,
  getTrips,
  getTripById,
  createTrip as createTripInRepo,
  updateTrip as updateTripInRepo,
  deleteTrip as deleteTripInRepo,
  getFuelRecords,
  getFuelRecordById,
  createFuelRecord as createFuelRecordInRepo,
  updateFuelRecord as updateFuelRecordInRepo,
  deleteFuelRecord as deleteFuelRecordInRepo,
  getMaintenances,
  getMaintenanceById,
  createMaintenance as createMaintenanceInRepo,
  updateMaintenance as updateMaintenanceInRepo,
  deleteMaintenance as deleteMaintenanceInRepo,
  getDocuments,
  getDocumentById,
  createDocument as createDocumentInRepo,
  updateDocument as updateDocumentInRepo,
  deleteDocument as deleteDocumentInRepo,
  getReports,
  getReportById,
  createReport as createReportInRepo,
  updateReport as updateReportInRepo,
  deleteReport as deleteReportInRepo
} from '../repositories/manager.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboard = async (_req, res) => {
  return sendSuccess(res, 200, { message: 'Manager dashboard ready' }, 'Dashboard loaded');
};

// Vehicles Controllers
export const listVehicles = async (req, res, next) => {
  try {
    const vehicles = await getVehicles({ assignedManager: req.user._id });
    return sendSuccess(res, 200, vehicles, 'Vehicles fetched');
  } catch (error) {
    next(error);
  }
};

export const getVehicleDetails = async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, vehicle, 'Vehicle details fetched');
  } catch (error) {
    next(error);
  }
};

export const createVehicle = async (req, res, next) => {
  try {
    const {
      // Required
      vehicleNumber, model, brand,
      // Classification
      type, branch,
      // Assignment & metrics
      driver, fuelLevel, fastagBalance,
      // Optional fields
      year,
      registrationNumber, registrationState, registrationType,
      fuelType, transmissionType, seatingCapacity, engineCC,
      insuranceExpiry, lastService, nextService,
      ownership, availability, status,
    } = req.body;

    if (!vehicleNumber || !model || !brand) {
      return sendError(res, 400, 'Vehicle number, model, and brand are required');
    }

    const vehicle = await createVehicleInRepo({
      vehicleNumber,
      model,
      brand,
      type,
      branch,
      driver,
      fuelLevel: fuelLevel !== undefined ? Number(fuelLevel) : 50,
      fastagBalance: fastagBalance !== undefined ? Number(fastagBalance) : 0,
      year,
      registrationNumber,
      registrationState,
      registrationType,
      fuelType,
      transmissionType,
      seatingCapacity,
      engineCC,
      insuranceExpiry: insuranceExpiry || undefined,
      lastService: lastService || undefined,
      nextService: nextService || undefined,
      ownership,
      availability,
      status: status || 'ACTIVE',
      assignedManager: req.user._id,
    });

    return sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this registration number already exists');
    }
    next(error);
  }
};

export const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await getVehicleByIdInRepo(req.params.id);
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');
    return sendSuccess(res, 200, vehicle, 'Vehicle fetched');
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await updateVehicleInRepo(req.params.id, req.body);
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');
    return sendSuccess(res, 200, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this registration number already exists');
    }
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await deleteVehicleInRepo(req.params.id);
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');
    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await updateVehicleInRepo(req.params.id, req.body);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, vehicle, 'Vehicle updated');
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await deleteVehicleInRepo(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, null, 'Vehicle deleted');
  } catch (error) {
    next(error);
  }
};

// Drivers Controllers
export const listDrivers = async (req, res, next) => {
  try {
    const drivers = await getDrivers({ assignedManager: req.user._id });
    return sendSuccess(res, 200, drivers, 'Drivers fetched');
  } catch (error) {
    next(error);
  }
};

export const getDriverDetails = async (req, res, next) => {
  try {
    const driver = await getDriverById(req.params.id);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
    return sendSuccess(res, 200, driver, 'Driver details fetched');
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      licenseNumber,
      licenseType,
      licenseExpiry,
      assignedVehicle,
      status
    } = req.body;

    if (!name || !email || !phone || !licenseNumber) {
      return sendError(res, 400, 'Name, email, phone, and license number are required');
    }

    const driver = await createDriverInRepo({
      name,
      email,
      phone,
      licenseNumber,
      licenseType,
      licenseExpiry,
      assignedVehicle,
      status,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, driver, 'Driver created');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A driver with this email or license number already exists');
    }
    next(error);
  }
};

export const updateDriver = async (req, res, next) => {
  try {
    const driver = await updateDriverInRepo(req.params.id, req.body);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
    return sendSuccess(res, 200, driver, 'Driver updated');
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await deleteDriverInRepo(req.params.id);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
    return sendSuccess(res, 200, null, 'Driver deleted');
  } catch (error) {
    next(error);
  }
};

// Trips Controllers
export const listTrips = async (req, res, next) => {
  try {
    const trips = await getTrips({ assignedManager: req.user._id });
    return sendSuccess(res, 200, trips, 'Trips fetched');
  } catch (error) {
    next(error);
  }
};

export const getTripDetails = async (req, res, next) => {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    return sendSuccess(res, 200, trip, 'Trip details fetched');
  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req, res, next) => {
  try {
    const {
      tripNumber,
      vehicle,
      driver,
      driverName,
      driverPhone,
      vehicleName,
      vehiclePlate,
      startLocation,
      endLocation,
      departureTime,
      eta,
      status,
      description
    } = req.body;

    if (!tripNumber || !vehicle || !driver || !startLocation || !endLocation || !departureTime || !eta) {
      return sendError(res, 400, 'Trip number, vehicle, driver, route, and timing details are required');
    }

    const trip = await createTripInRepo({
      tripNumber,
      vehicle,
      driver,
      driverName,
      driverPhone,
      vehicleName,
      vehiclePlate,
      startLocation,
      endLocation,
      departureTime,
      eta,
      status,
      description,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, trip, 'Trip created');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 400, 'A trip with this trip number already exists');
    }
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await updateTripInRepo(req.params.id, req.body);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    return sendSuccess(res, 200, trip, 'Trip updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await deleteTripInRepo(req.params.id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    return sendSuccess(res, 200, null, 'Trip deleted');
  } catch (error) {
    next(error);
  }
};

// Fuel Controllers
export const listFuelRecords = async (req, res, next) => {
  try {
    const records = await getFuelRecords({ recordedBy: req.user._id });
    return sendSuccess(res, 200, records, 'Fuel records fetched');
  } catch (error) {
    next(error);
  }
};

export const getFuelRecordDetails = async (req, res, next) => {
  try {
    const record = await getFuelRecordById(req.params.id);
    if (!record) {
      return sendError(res, 404, 'Fuel record not found');
    }
    return sendSuccess(res, 200, record, 'Fuel record details fetched');
  } catch (error) {
    next(error);
  }
};

export const createFuelRecord = async (req, res, next) => {
  try {
    const {
      vehicle,
      vehicleId,
      vehicleName,
      driver,
      fuelStation,
      amount,
      liters,
      status,
      resolutionComment,
      hasReceipt
    } = req.body;

    if (!vehicle || amount === undefined || liters === undefined) {
      return sendError(res, 400, 'Vehicle, amount, and liters are required');
    }

    const record = await createFuelRecordInRepo({
      vehicle,
      vehicleId,
      vehicleName,
      driver,
      fuelStation,
      amount,
      liters,
      status,
      resolutionComment,
      hasReceipt,
      recordedBy: req.user._id
    });

    return sendSuccess(res, 201, record, 'Fuel record created');
  } catch (error) {
    next(error);
  }
};

export const updateFuelRecord = async (req, res, next) => {
  try {
    const record = await updateFuelRecordInRepo(req.params.id, req.body);
    if (!record) {
      return sendError(res, 404, 'Fuel record not found');
    }
    return sendSuccess(res, 200, record, 'Fuel record updated');
  } catch (error) {
    next(error);
  }
};

export const deleteFuelRecord = async (req, res, next) => {
  try {
    const record = await deleteFuelRecordInRepo(req.params.id);
    if (!record) {
      return sendError(res, 404, 'Fuel record not found');
    }
    return sendSuccess(res, 200, null, 'Fuel record deleted');
  } catch (error) {
    next(error);
  }
};

// Maintenance Controllers
export const listMaintenance = async (req, res, next) => {
  try {
    const maintenance = await getMaintenances({ recordedBy: req.user._id });
    return sendSuccess(res, 200, maintenance, 'Maintenance list fetched');
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceDetails = async (req, res, next) => {
  try {
    const maintenance = await getMaintenanceById(req.params.id);
    if (!maintenance) {
      return sendError(res, 404, 'Maintenance not found');
    }
    return sendSuccess(res, 200, maintenance, 'Maintenance details fetched');
  } catch (error) {
    next(error);
  }
};

export const createMaintenance = async (req, res, next) => {
  try {
    const {
      vehicle,
      vehicleId,
      vehicleName,
      serviceType,
      scheduledDate,
      status,
      cost,
      specialist,
      garage,
      comments
    } = req.body;

    if (!vehicle || !serviceType || !scheduledDate) {
      return sendError(res, 400, 'Vehicle, service type, and scheduled date are required');
    }

    const maintenance = await createMaintenanceInRepo({
      vehicle,
      vehicleId,
      vehicleName,
      serviceType,
      scheduledDate,
      status,
      cost,
      specialist,
      garage,
      comments,
      recordedBy: req.user._id
    });

    return sendSuccess(res, 201, maintenance, 'Maintenance created');
  } catch (error) {
    next(error);
  }
};

export const updateMaintenance = async (req, res, next) => {
  try {
    const maintenance = await updateMaintenanceInRepo(req.params.id, req.body);
    if (!maintenance) {
      return sendError(res, 404, 'Maintenance not found');
    }
    return sendSuccess(res, 200, maintenance, 'Maintenance updated');
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance = await deleteMaintenanceInRepo(req.params.id);
    if (!maintenance) {
      return sendError(res, 404, 'Maintenance not found');
    }
    return sendSuccess(res, 200, null, 'Maintenance deleted');
  } catch (error) {
    next(error);
  }
};

// Documents Controllers
export const listDocuments = async (req, res, next) => {
  try {
    const documents = await getDocuments({ uploadedBy: req.user._id });
    return sendSuccess(res, 200, documents, 'Documents fetched');
  } catch (error) {
    next(error);
  }
};

export const getDocumentDetails = async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }
    return sendSuccess(res, 200, document, 'Document details fetched');
  } catch (error) {
    next(error);
  }
};

export const createDocument = async (req, res, next) => {
  try {
    const {
      title,
      fileUrl,
      type,
      category,
      vehicle,
      driver,
      trip,
      expiry,
      status,
      fileSize,
      fileType
    } = req.body;

    if (!title || !fileUrl || !type) {
      return sendError(res, 400, 'Title, fileUrl, and type are required');
    }

    const document = await createDocumentInRepo({
      title,
      fileUrl,
      type,
      category,
      vehicle,
      driver,
      trip,
      expiry,
      status,
      fileSize,
      fileType,
      uploadedBy: req.user._id
    });

    return sendSuccess(res, 201, document, 'Document uploaded');
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const document = await updateDocumentInRepo(req.params.id, req.body);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }
    return sendSuccess(res, 200, document, 'Document updated');
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await deleteDocumentInRepo(req.params.id);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }
    return sendSuccess(res, 200, null, 'Document deleted');
  } catch (error) {
    next(error);
  }
};

// Reports Controllers
export const listReports = async (req, res, next) => {
  try {
    const reports = await getReports({ generatedBy: req.user._id });
    return sendSuccess(res, 200, reports, 'Reports fetched');
  } catch (error) {
    next(error);
  }
};

export const getReportDetails = async (req, res, next) => {
  try {
    const report = await getReportById(req.params.id);
    if (!report) {
      return sendError(res, 404, 'Report not found');
    }
    return sendSuccess(res, 200, report, 'Report details fetched');
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const {
      name,
      type,
      frequency,
      day,
      time,
      format,
      recipients,
      status
    } = req.body;

    if (!name || !type) {
      return sendError(res, 400, 'Name and type are required');
    }

    const report = await createReportInRepo({
      name,
      type,
      frequency,
      day,
      time,
      format,
      recipients,
      status,
      generatedBy: req.user._id
    });

    return sendSuccess(res, 201, report, 'Report created');
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const report = await updateReportInRepo(req.params.id, req.body);
    if (!report) {
      return sendError(res, 404, 'Report not found');
    }
    return sendSuccess(res, 200, report, 'Report updated');
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await deleteReportInRepo(req.params.id);
    if (!report) {
      return sendError(res, 404, 'Report not found');
    }
    return sendSuccess(res, 200, null, 'Report deleted');
  } catch (error) {
    next(error);
  }
};
