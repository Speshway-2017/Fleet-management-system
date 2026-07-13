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
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import EWayBill from '../models/EWayBill.js';

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

    // A. Verify vehicle availability in database
    const activeTripsWithVehicle = await Trip.findOne({
      vehicle,
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });
    if (activeTripsWithVehicle) {
      return sendError(res, 400, 'This vehicle is already allocated to another active trip');
    }

    // B. Verify driver availability in database
    const activeTripsWithDriver = await Trip.findOne({
      driver,
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });
    if (activeTripsWithDriver) {
      return sendError(res, 400, 'This driver is already allocated to another active trip');
    }

    // C. Create the trip
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

    // D. Update vehicle status in MongoDB to Assigned
    await Vehicle.findByIdAndUpdate(vehicle, {
      currentStatus: 'Assigned',
      assignedDriver: driver
    });

    // E. Update driver status in MongoDB to ASSIGNED
    const selectedVeh = await Vehicle.findById(vehicle);
    await Driver.findByIdAndUpdate(driver, {
      driverStatus: 'ASSIGNED',
      assignedVehicle: selectedVeh ? selectedVeh.vehicleNumber : 'Unassigned'
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
    const tripId = req.params.id;
    const existingTrip = await Trip.findById(tripId);
    if (!existingTrip) {
      return sendError(res, 404, 'Trip not found');
    }

    const updatedTrip = await updateTripInRepo(tripId, req.body);

    const newStatus = req.body.status;
    if (newStatus && (newStatus === 'Completed' || newStatus === 'Cancelled' || newStatus === 'Canceled')) {
      // Release vehicle
      if (updatedTrip.vehicle) {
        await Vehicle.findByIdAndUpdate(updatedTrip.vehicle, {
          currentStatus: 'Available',
          assignedDriver: null
        });
      }
      // Release driver
      if (updatedTrip.driver) {
        await Driver.findByIdAndUpdate(updatedTrip.driver, {
          driverStatus: 'AVAILABLE',
          assignedVehicle: 'Unassigned'
        });
      }
    } else if (newStatus && (newStatus === 'On Transit' || newStatus === 'On Trip' || newStatus === 'Scheduled' || newStatus === 'Assigned' || newStatus === 'In Progress' || newStatus === 'Delayed')) {
      if (updatedTrip.vehicle) {
        await Vehicle.findByIdAndUpdate(updatedTrip.vehicle, {
          currentStatus: 'Assigned',
          assignedDriver: updatedTrip.driver
        });
      }
      if (updatedTrip.driver && updatedTrip.vehicle) {
        const selectedVeh = await Vehicle.findById(updatedTrip.vehicle);
        await Driver.findByIdAndUpdate(updatedTrip.driver, {
          driverStatus: 'ASSIGNED',
          assignedVehicle: selectedVeh ? selectedVeh.vehicleNumber : 'Unassigned'
        });
      }
    }

    return sendSuccess(res, 200, updatedTrip, 'Trip updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    // Release vehicle
    if (trip.vehicle) {
      await Vehicle.findByIdAndUpdate(trip.vehicle, {
        currentStatus: 'Available',
        assignedDriver: null
      });
    }
    // Release driver
    if (trip.driver) {
      await Driver.findByIdAndUpdate(trip.driver, {
        driverStatus: 'AVAILABLE',
        assignedVehicle: 'Unassigned'
      });
    }

    await deleteTripInRepo(tripId);
    return sendSuccess(res, 200, null, 'Trip deleted successfully');
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
    
    // Calculate dynamic status for each document on fetch
    const enriched = documents.map(d => {
      const doc = d.toObject ? d.toObject() : d;
      if (doc.expiry) {
        const expDate = new Date(doc.expiry);
        if (!isNaN(expDate.getTime())) {
          const now = new Date();
          expDate.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) {
            doc.status = "Expired";
          } else if (diffDays <= 30) {
            doc.status = "Expiring Soon";
          } else {
            doc.status = "Active";
          }
        }
      }
      return doc;
    });

    return sendSuccess(res, 200, enriched, 'Documents fetched');
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
    
    const doc = document.toObject ? document.toObject() : document;
    if (doc.expiry) {
      const expDate = new Date(doc.expiry);
      if (!isNaN(expDate.getTime())) {
        const now = new Date();
        expDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          doc.status = "Expired";
        } else if (diffDays <= 30) {
          doc.status = "Expiring Soon";
        } else {
          doc.status = "Active";
        }
      }
    }

    return sendSuccess(res, 200, doc, 'Document details fetched');
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

    let computedStatus = status || 'Active';
    if (expiry) {
      const expDate = new Date(expiry);
      if (!isNaN(expDate.getTime())) {
        const now = new Date();
        expDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          computedStatus = 'Expired';
        } else if (diffDays <= 30) {
          computedStatus = 'Expiring Soon';
        } else {
          computedStatus = 'Active';
        }
      }
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
      status: computedStatus,
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
    const updateData = { ...req.body };
    if (updateData.expiry) {
      const expDate = new Date(updateData.expiry);
      if (!isNaN(expDate.getTime())) {
        const now = new Date();
        expDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          updateData.status = 'Expired';
        } else if (diffDays <= 30) {
          updateData.status = 'Expiring Soon';
        } else {
          updateData.status = 'Active';
        }
      }
    }

    const document = await updateDocumentInRepo(req.params.id, updateData);
    if (!document) {
      return sendError(res, 404, 'Document not found');
    }

    const doc = document.toObject ? document.toObject() : document;
    if (doc.expiry) {
      const expDate = new Date(doc.expiry);
      if (!isNaN(expDate.getTime())) {
        const now = new Date();
        expDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
          doc.status = "Expired";
        } else if (diffDays <= 30) {
          doc.status = "Expiring Soon";
        } else {
          doc.status = "Active";
        }
      }
    }

    return sendSuccess(res, 200, doc, 'Document updated');
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

export const getLiveTracking = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find().populate('assignedDriver').sort({ createdAt: -1 });
    const trips = await Trip.find({
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip', 'Ready to Dispatch'] }
    }).populate('vehicle').populate('driver');

    const trackingData = vehicles.map(v => {
      const activeTrip = trips.find(t => t.vehicle && String(t.vehicle._id || t.vehicle) === String(v._id));

      let assignmentStatus = "Available";
      if (activeTrip) {
        if (['Scheduled', 'Assigned', 'Ready to Dispatch'].includes(activeTrip.status)) {
          assignmentStatus = "Assigned";
        } else if (['In Progress', 'On Trip', 'On Transit', 'Delayed'].includes(activeTrip.status)) {
          assignmentStatus = "On Trip";
        }
      } else if (v.currentStatus === "Maintenance") {
        assignmentStatus = "Maintenance";
      } else if (v.currentStatus === "Inactive") {
        assignmentStatus = "Inactive";
      } else if (v.currentStatus === "Assigned") {
        assignmentStatus = "Assigned";
      } else if (v.currentStatus === "On Trip") {
        assignmentStatus = "On Trip";
      }

      const driverName = v.assignedDriver?.fullName || (activeTrip ? (activeTrip.driver?.fullName || activeTrip.driverName) : "Unassigned");
      const driverPhone = v.assignedDriver?.phoneNumber || (activeTrip ? (activeTrip.driver?.phoneNumber || activeTrip.driverPhone) : "");

      return {
        _id: v._id,
        vehicleName: v.vehicleName,
        vehicleNumber: v.vehicleNumber,
        vehicleType: v.vehicleType,
        brand: v.brand,
        model: v.model,
        currentStatus: v.currentStatus,
        fuelCapacity: v.fuelCapacity,
        updatedAt: v.updatedAt,
        assignedDriver: v.assignedDriver ? {
          _id: v.assignedDriver._id,
          fullName: driverName,
          phoneNumber: driverPhone
        } : (activeTrip ? {
          fullName: driverName,
          phoneNumber: driverPhone
        } : null),
        activeTrip: activeTrip ? {
          _id: activeTrip._id,
          tripNumber: activeTrip.tripNumber,
          startLocation: activeTrip.startLocation,
          endLocation: activeTrip.endLocation,
          status: activeTrip.status,
          eta: activeTrip.eta,
          driverName: driverName,
          driverPhone: driverPhone
        } : null,
        assignmentStatus
      };
    });

    return sendSuccess(res, 200, trackingData, 'Live tracking data fetched');
  } catch (error) {
    next(error);
  }
};

// E-Way Bills Helper for Dynamic Validity & Status Calculation
const enrichEWayBill = (billObj) => {
  const bill = billObj.toObject ? billObj.toObject() : billObj;

  // Resolve source of truth dates
  const genDate = bill.generationDate ? new Date(bill.generationDate) : new Date(bill.createdAt || Date.now());
  const valDays = parseInt(bill.validityDays) || 1;

  let expDate;
  if (bill.expiryDate) {
    expDate = new Date(bill.expiryDate);
  } else {
    // Legacy fallback
    expDate = new Date(genDate.getTime() + valDays * 24 * 60 * 60 * 1000);
  }

  // Calculate remaining days (midnight-to-midnight format for robust transitions)
  const expiryMidnight = new Date(expDate);
  expiryMidnight.setHours(23, 59, 59, 999);

  const nowMidnight = new Date();
  nowMidnight.setHours(0, 0, 0, 0);

  const diffTime = expiryMidnight.getTime() - nowMidnight.getTime();
  const remainingDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

  // Status Mapping:
  // - More than 7 days remaining → Active (Green)
  // - 1–7 days remaining → Expiring Soon (Orange)
  // - 0 days remaining → Expires Today (Blue)
  // - Expired (remainingDays < 0) → Expired (Red)
  let status = "Active";
  let progressColor = "bg-green-600";

  if (remainingDays < 0) {
    status = "Expired";
    progressColor = "bg-red-650";
  } else if (remainingDays === 0) {
    status = "Expires Today";
    progressColor = "bg-blue-600";
  } else if (remainingDays >= 1 && remainingDays <= 7) {
    status = "Expiring Soon";
    progressColor = "bg-amber-600";
  }

  // Remaining Validity text (e.g. "Expires Today", "Expired 5 Days Ago", "25 Days Remaining")
  let remainingValidityText = "";
  if (remainingDays === valDays) {
    remainingValidityText = `Valid for ${valDays} Days`;
  } else if (remainingDays > 0) {
    remainingValidityText = `${remainingDays} Days Remaining`;
  } else if (remainingDays === 0) {
    remainingValidityText = "Expires Today";
  } else {
    remainingValidityText = `Expired ${Math.abs(remainingDays)} Days Ago`;
  }

  // Validity string representation (Format: "28 Jul, 13:52")
  const validityStr = expDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  }) + ", " + expDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  // Validity progress bar percentage calculation
  const validityProgress = remainingDays < 0
    ? 0
    : Math.max(0, Math.min(100, Math.round((remainingDays / valDays) * 100)));

  return {
    ...bill,
    status,
    progressColor,
    validityProgress,
    remainingDays,
    remainingValidityText,
    validity: validityStr,
    generationDate: genDate,
    expiryDate: expDate,
    validityDays: valDays,
    canExtend: remainingDays >= 0 && remainingDays <= 7 // Can extend in the expiring/expires today range
  };
};

export const listEWayBills = async (req, res, next) => {
  try {
    let bills = await EWayBill.find({ assignedManager: req.user._id }).sort({ createdAt: -1 });

    // Seed initial mock data if none exist
    if (bills.length === 0) {
      const now = new Date();
      const initialBills = [
        {
          ewayBillNo: "EWB-2024-8832",
          invoiceNo: "#INV-00421",
          vehicleNo: "MH 12 QX 4582",
          transporterName: "Gati KWE Logistics",
          fromLoc: "Mumbai",
          toLoc: "Delhi",
          goodsValue: "540000",
          assignedManager: req.user._id,
          generationDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          validityDays: 30,
          expiryDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // expires in 25 days (Active)
        },
        {
          ewayBillNo: "EWB-2024-7710",
          invoiceNo: "#INV-00418",
          vehicleNo: "KA 01 HY 9912",
          transporterName: "VRL Logistics",
          fromLoc: "Bangalore",
          toLoc: "Chennai",
          goodsValue: "320000",
          assignedManager: req.user._id,
          generationDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          validityDays: 5,
          expiryDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // expires in 3 days (Expiring Soon)
        },
        {
          ewayBillNo: "EWB-2024-9102",
          invoiceNo: "#INV-00430",
          vehicleNo: "GJ 05 TR 3302",
          transporterName: "Safe Express",
          fromLoc: "Surat",
          toLoc: "Ahmedabad",
          goodsValue: "180000",
          assignedManager: req.user._id,
          generationDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          validityDays: 1,
          expiryDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // expired yesterday (Expired)
        }
      ];
      await EWayBill.insertMany(initialBills);
      bills = await EWayBill.find({ assignedManager: req.user._id }).sort({ createdAt: -1 });
    }

    const enriched = bills.map(enrichEWayBill);
    return sendSuccess(res, 200, enriched, 'E-Way Bills fetched');
  } catch (error) {
    next(error);
  }
};

export const createEWayBill = async (req, res, next) => {
  try {
    const {
      vehicleNo,
      transporterName,
      fromLoc,
      toLoc,
      invoiceNo,
      goodsValue,
      ewayBillNo,
      validityDays
    } = req.body;

    if (!vehicleNo || !transporterName || !fromLoc || !toLoc || !invoiceNo || !goodsValue) {
      return sendError(res, 400, 'All details are required to generate E-Way Bill');
    }

    const days = parseInt(validityDays) || 1;
    const genDate = new Date();
    const expDate = new Date(genDate.getTime() + days * 24 * 60 * 60 * 1000);

    const newBill = new EWayBill({
      ewayBillNo: ewayBillNo || `EWB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNo,
      vehicleNo,
      transporterName,
      fromLoc,
      toLoc,
      goodsValue,
      generationDate: genDate,
      validityDays: days,
      expiryDate: expDate,
      assignedManager: req.user._id
    });

    await newBill.save();
    return sendSuccess(res, 201, enrichEWayBill(newBill), 'E-Way Bill generated');
  } catch (error) {
    next(error);
  }
};

export const extendEWayBill = async (req, res, next) => {
  try {
    const bill = await EWayBill.findOne({ _id: req.params.id, assignedManager: req.user._id });
    if (!bill) {
      return sendError(res, 404, 'E-Way Bill not found');
    }

    const currentExp = bill.expiryDate ? new Date(bill.expiryDate) : new Date(Date.now());
    bill.expiryDate = new Date(currentExp.getTime() + 24 * 60 * 60 * 1000); // add 24 hours
    bill.validityDays = (bill.validityDays || 1) + 1;

    await bill.save();
    return sendSuccess(res, 200, enrichEWayBill(bill), 'E-Way Bill validity extended');
  } catch (error) {
    next(error);
  }
};

export const updateEWayBill = async (req, res, next) => {
  try {
    const { vehicleNo, transporterName, fromLoc, toLoc, invoiceNo, goodsValue, validity } = req.body;
    const bill = await EWayBill.findOne({ _id: req.params.id, assignedManager: req.user._id });
    if (!bill) {
      return sendError(res, 404, 'E-Way Bill not found');
    }

    if (vehicleNo !== undefined) bill.vehicleNo = vehicleNo;
    if (transporterName !== undefined) bill.transporterName = transporterName;
    if (fromLoc !== undefined) bill.fromLoc = fromLoc;
    if (toLoc !== undefined) bill.toLoc = toLoc;
    if (invoiceNo !== undefined) bill.invoiceNo = invoiceNo;
    if (goodsValue !== undefined) bill.goodsValue = goodsValue;

    if (validity !== undefined) {
      const parsedDate = new Date(validity);
      if (!isNaN(parsedDate.getTime())) {
        bill.expiryDate = parsedDate;
        const gen = bill.generationDate ? new Date(bill.generationDate) : new Date(bill.createdAt || Date.now());
        const diffTime = parsedDate.getTime() - gen.getTime();
        bill.validityDays = Math.max(1, Math.ceil(diffTime / (24 * 60 * 60 * 1000)));
      }
    }

    await bill.save();
    return sendSuccess(res, 200, enrichEWayBill(bill), 'E-Way Bill updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteEWayBill = async (req, res, next) => {
  try {
    const bill = await EWayBill.findOneAndDelete({ _id: req.params.id, assignedManager: req.user._id });
    if (!bill) {
      return sendError(res, 404, 'E-Way Bill not found');
    }
    return sendSuccess(res, 200, null, 'E-Way Bill deleted successfully');
  } catch (error) {
    next(error);
  }
};
