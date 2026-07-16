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
  deleteReport as deleteReportInRepo,
  getManagerNotifications,
  markManagerNotificationRead,
  markAllManagerNotificationsRead,
  deleteManagerNotification
} from '../repositories/manager.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createAndEmitNotification } from '../utils/notification.js';
import { processVehicleDocuments } from '../utils/documentHelper.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Notification from '../models/Notification.js';
import EWayBill from '../models/EWayBill.js';
import Fuel from '../models/Fuel.js';
import ActivityLog from '../models/ActivityLog.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import ManagerMilestone from '../models/ManagerMilestone.js';
import { logActivity } from '../utils/activityLogger.js';
import { calculateDistance } from '../utils/distanceCalculator.js';

export const getDashboard = async (req, res, next) => {
  try {
    const managerId = req.user._id;

    // 1. Fetch total and active vehicles
    const totalVehicles = await Vehicle.countDocuments({ assignedManager: managerId });
    const activeVehicles = await Vehicle.countDocuments({ 
      assignedManager: managerId, 
      currentStatus: { $in: ['Active', 'On Trip'] } 
    });

    // 2. Trips Today (scheduled, on transit, delayed)
    const tripsToday = await Trip.countDocuments({ 
      assignedManager: managerId, 
      status: { $in: ['Scheduled', 'On Transit', 'Delayed'] } 
    });

    // 3. Vehicles under repair
    const underRepair = await Vehicle.countDocuments({ 
      assignedManager: managerId, 
      currentStatus: 'Maintenance' 
    });

    // 4. Drivers available
    const driversAvailable = await Driver.countDocuments({ 
      assignedManager: managerId, 
      driverStatus: 'AVAILABLE' 
    });

    // 5. Fuel Expense: sum up amounts from Fuel records
    // First, find all vehicle IDs assigned to the manager
    const managerVehicles = await Vehicle.find({ assignedManager: managerId }, '_id');
    const vehicleIds = managerVehicles.map(v => v._id);

    const fuelDocs = await Fuel.find({ 
      $or: [
        { vehicle: { $in: vehicleIds } }, 
        { recordedBy: managerId }
      ] 
    });
    const fuelSum = fuelDocs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const fuelExpense = `₹${fuelSum.toLocaleString('en-IN')}`;

    // 6. Total Earnings: sum up goodsValue from generated EWayBills
    const ewayBills = await EWayBill.find({ assignedManager: managerId });
    const earningsSum = ewayBills.reduce((acc, curr) => acc + (Number(curr.goodsValue) || 0), 0);
    
    let totalEarnings = "";
    if (earningsSum >= 10000000) {
      const shortNum = (earningsSum / 10000000).toFixed(1);
      totalEarnings = `₹${shortNum} Cr`;
    } else if (earningsSum >= 100000) {
      const shortNum = (earningsSum / 100000).toFixed(1);
      totalEarnings = `₹${shortNum} L`;
    } else {
      totalEarnings = `₹${earningsSum.toLocaleString('en-IN')}`;
    }

    // 7. Check for subscription expiry warning (<= 10 days) and create in-app notification
    if (req.user.subscriptionStatus === 'ACTIVE' && req.user.subscriptionExpiry) {
      const expiry = new Date(req.user.subscriptionExpiry);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays <= 10) {
        // Check if alert already exists for this expiry date
        const existingNotification = await Notification.findOne({
          recipient: managerId,
          type: 'warning',
          'metadata.expiryDate': req.user.subscriptionExpiry
        });

        if (!existingNotification) {
          const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
          await createAndEmitNotification({
            io,
            recipient: managerId,
            type: 'warning',
            title: 'Subscription Expiring Soon',
            message: `Your subscription will expire in ${diffDays} days on ${expiry.toLocaleDateString('en-IN')}. Please renew to prevent service disruption.`,
            priority: 'high',
            metadata: {
              expiryDate: req.user.subscriptionExpiry,
              daysRemaining: diffDays
            }
          });
        }
      }
    }

    return sendSuccess(res, 200, {
      totalVehicles,
      activeVehicles,
      tripsToday,
      underRepair,
      driversAvailable,
      fuelExpense,
      totalEarnings
    }, 'Dashboard stats loaded');
  } catch (error) {
    next(error);
  }
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
      vehicleName,
      vehicleNumber,
      registrationNumber,
      vehicleType,
      brand,
      manufacturer,
      model,
      manufactureYear,
      year,
      assignedDriver,
      driver,
      currentStatus,
      status,
      fuelType,
      fuelCapacity,
      fastagBalance,
      insuranceExpiry,
      rcExpiry,
      pollutionExpiry,
      permitExpiry,
      fitnessExpiry,
      odometer,
      image,
      chassisNumber,
      loadCapacity,
      ownershipType,
      ownership,
      insuranceDetails,
      permitDetails,
      documents,
      engineCC,
      engineNumber,
      fastagNumber,
      lastService,
      lastServiceDate,
      nextService,
      nextServiceDue,
      transmissionType,
      transmission,
      seatingCapacity,
      registrationState,
      registrationType,
      availability,
      branch,
      branchDepot,
    } = req.body;

     const resolvedVehicleNumber = vehicleNumber || req.body.vehicleNumber;
    if (!resolvedVehicleNumber) {
      return sendError(res, 400, 'Vehicle number is required');
    }

    const trimmedChassis = (chassisNumber || '').trim();
    if (trimmedChassis.length !== 17) {
      return sendError(res, 400, 'Please enter exactly 17 characters.');
    }

    const conflictOr = [
      { vehicleNumber: resolvedVehicleNumber.toUpperCase() }
    ];
    if (registrationNumber) {
      conflictOr.push({ registrationNumber: registrationNumber.toUpperCase() });
    }
    if (trimmedChassis) {
      conflictOr.push({ chassisNumber: trimmedChassis });
    }

    const existingVehicle = await Vehicle.findOne({ $or: conflictOr });
    if (existingVehicle) {
      if (existingVehicle.vehicleNumber === resolvedVehicleNumber.toUpperCase()) {
        return sendError(res, 409, 'A vehicle with this registration plate already exists');
      }
      if (registrationNumber && existingVehicle.registrationNumber === registrationNumber.toUpperCase()) {
        return sendError(res, 409, 'A vehicle with this registration number already exists');
      }
      if (trimmedChassis && existingVehicle.chassisNumber === trimmedChassis) {
        return sendError(res, 409, 'A vehicle with this chassis number already exists');
      }
    }

    const processedDocs = await processVehicleDocuments(documents, req.user);

    const resolvedBrand = brand || manufacturer;
    const resolvedTransmission = transmissionType || transmission || 'Manual';
    const resolvedOwnership = ownershipType || ownership || 'Owned';
    const resolvedBranch = branch || branchDepot || 'Pune';
    const resolvedLastService = lastService || lastServiceDate || undefined;
    const resolvedNextService = nextService || nextServiceDue || undefined;
    const resolvedYear = manufactureYear || year;

    const vehicle = await createVehicleInRepo({
      vehicleName: vehicleName || (resolvedBrand ? `${resolvedBrand} ${model}` : model),
      vehicleNumber: resolvedVehicleNumber,
      registrationNumber: registrationNumber || resolvedVehicleNumber,
      vehicleType: vehicleType || req.body.type || 'Truck',
      brand: resolvedBrand,
      manufacturer: resolvedBrand,
      model,
      manufactureYear: resolvedYear ? Number(resolvedYear) : undefined,
      assignedDriver: assignedDriver || driver || undefined,
      currentStatus: currentStatus || status || 'Available',
      fuelType: fuelType || 'Diesel',
      fuelCapacity: fuelCapacity !== undefined ? Number(fuelCapacity) : 0,
      fastagBalance: fastagBalance !== undefined ? Number(fastagBalance) : 0,
      insuranceExpiry: insuranceExpiry || undefined,
      rcExpiry: rcExpiry || undefined,
      pollutionExpiry: pollutionExpiry || undefined,
      permitExpiry: permitExpiry || undefined,
      fitnessExpiry: fitnessExpiry || undefined,
      odometer: odometer !== undefined ? Number(odometer) : 0,
      image: image || '',
      assignedManager: req.user?._id,
      createdBy: req.user?._id,
      chassisNumber,
      loadCapacity: loadCapacity !== undefined ? Number(loadCapacity) : 0,
      ownershipType: resolvedOwnership,
      ownership: resolvedOwnership,
      insuranceDetails,
      permitDetails,
      documents: processedDocs,
      engineCC,
      engineNumber,
      fastagNumber,
      lastService: resolvedLastService,
      lastServiceDate: resolvedLastService,
      nextService: resolvedNextService,
      nextServiceDue: resolvedNextService,
      transmissionType: resolvedTransmission,
      transmission: resolvedTransmission,
      seatingCapacity: seatingCapacity || '2',
      registrationState,
      registrationType: registrationType || 'New',
      availability: availability || 'Immediate',
      branch: resolvedBranch,
      branchDepot: resolvedBranch,
    });

    await logActivity({
      title: 'Vehicle Added',
      description: `Vehicle ${vehicle.vehicleNumber} (${vehicle.brand} ${vehicle.model}) was added to branch ${vehicle.branch || 'Pune'}.`,
      activityType: 'VEHICLE_ADDED',
      user: req.user,
      assignedManager: req.user._id
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
    // Ownership check
    const managerId = vehicle.assignedManager?._id || vehicle.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
    }
    return sendSuccess(res, 200, vehicle, 'Vehicle fetched');
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    // Ownership check before update
    const existingVeh = await getVehicleByIdInRepo(req.params.id);
    if (!existingVeh) return sendError(res, 404, 'Vehicle not found');
    const managerId = existingVeh.assignedManager?._id || existingVeh.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
    }

    const updateData = { ...req.body };
    if (updateData.chassisNumber !== undefined) {
      const trimmedChassis = String(updateData.chassisNumber || '').trim();
      if (trimmedChassis.length !== 17) {
        return sendError(res, 400, 'Please enter exactly 17 characters.');
      }
      updateData.chassisNumber = trimmedChassis;
    }

    const conflictOr = [];
    if (updateData.vehicleNumber) {
      conflictOr.push({ vehicleNumber: updateData.vehicleNumber.toUpperCase() });
    }
    if (updateData.registrationNumber) {
      conflictOr.push({ registrationNumber: updateData.registrationNumber.toUpperCase() });
    }
    if (updateData.chassisNumber) {
      conflictOr.push({ chassisNumber: updateData.chassisNumber.trim() });
    }

    if (conflictOr.length > 0) {
      const existingVehicle = await Vehicle.findOne({
        _id: { $ne: req.params.id },
        $or: conflictOr
      });
      if (existingVehicle) {
        if (updateData.vehicleNumber && existingVehicle.vehicleNumber === updateData.vehicleNumber.toUpperCase()) {
          return sendError(res, 409, 'A vehicle with this registration plate already exists');
        }
        if (updateData.registrationNumber && existingVehicle.registrationNumber === updateData.registrationNumber.toUpperCase()) {
          return sendError(res, 409, 'A vehicle with this registration number already exists');
        }
        if (updateData.chassisNumber && existingVehicle.chassisNumber === updateData.chassisNumber.trim()) {
          return sendError(res, 409, 'A vehicle with this chassis number already exists');
        }
      }
    }
    if (updateData.documents) {
      updateData.documents = await processVehicleDocuments(updateData.documents, req.user);
    }
    
    if (updateData.manufacturer !== undefined || updateData.brand !== undefined) {
      updateData.brand = updateData.manufacturer || updateData.brand;
      updateData.manufacturer = updateData.brand;
    }
    if (updateData.transmissionType !== undefined || updateData.transmission !== undefined) {
      updateData.transmissionType = updateData.transmissionType || updateData.transmission;
      updateData.transmission = updateData.transmissionType;
    }
    if (updateData.ownershipType !== undefined || updateData.ownership !== undefined) {
      updateData.ownershipType = updateData.ownershipType || updateData.ownership;
      updateData.ownership = updateData.ownershipType;
    }
    if (updateData.branch !== undefined || updateData.branchDepot !== undefined) {
      updateData.branch = updateData.branch || updateData.branchDepot;
      updateData.branchDepot = updateData.branch;
    }
    if (updateData.lastService !== undefined || updateData.lastServiceDate !== undefined) {
      updateData.lastService = updateData.lastService || updateData.lastServiceDate;
      updateData.lastServiceDate = updateData.lastService;
    }
    if (updateData.nextService !== undefined || updateData.nextServiceDue !== undefined) {
      updateData.nextService = updateData.nextService || updateData.nextServiceDue;
      updateData.nextServiceDue = updateData.nextService;
    }
    updateData.updatedBy = req.user?._id;
    
    const vehicle = await updateVehicleInRepo(req.params.id, updateData);
    await logActivity({
      title: 'Vehicle Updated',
      description: `Vehicle ${vehicle.vehicleNumber} details were updated.`,
      activityType: 'VEHICLE_UPDATED',
      user: req.user,
      assignedManager: req.user._id
    });

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
    // Ownership check before delete
    const existingVeh = await getVehicleByIdInRepo(req.params.id);
    if (!existingVeh) return sendError(res, 404, 'Vehicle not found');
    const managerId = existingVeh.assignedManager?._id || existingVeh.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this vehicle belongs to another manager');
    }

    const vehicle = await deleteVehicleInRepo(req.params.id);
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');

    await logActivity({
      title: 'Vehicle Deleted',
      description: `Vehicle ${vehicle.vehicleNumber} was deleted from the system.`,
      activityType: 'VEHICLE_DELETED',
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
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
    // Ownership check
    const managerId = driver.assignedManager?._id || driver.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
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

    await logActivity({
      title: 'Driver Assigned',
      description: `Driver ${driver.name} was registered under status ${driver.status || 'AVAILABLE'}.`,
      activityType: 'DRIVER_ASSIGNED',
      user: req.user,
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
    // Ownership check before update
    const existingDriver = await getDriverById(req.params.id);
    if (!existingDriver) return sendError(res, 404, 'Driver not found');
    const managerId = existingDriver.assignedManager?._id || existingDriver.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
    }

    const driver = await updateDriverInRepo(req.params.id, req.body);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
    await logActivity({
      title: 'Driver Updated',
      description: `Driver ${driver.name} details were updated.`,
      activityType: 'DRIVER_ASSIGNED',
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 200, driver, 'Driver updated');
  } catch (error) {
    next(error);
  }
};

export const deleteDriver = async (req, res, next) => {
  try {
    // Ownership check before delete
    const existingDriver = await getDriverById(req.params.id);
    if (!existingDriver) return sendError(res, 404, 'Driver not found');
    const managerId = existingDriver.assignedManager?._id || existingDriver.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
    }

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
    const filter = { assignedManager: req.user._id };
    if (req.query.vehicle) {
      filter.vehicle = req.query.vehicle;
    }
    if (req.query.driver) {
      filter.driver = req.query.driver;
    }
    const trips = await getTrips(filter);
    
    // Map over trips and dynamically replace default/120 KM distances
    const processedTrips = trips.map(t => {
      const tripObj = t.toObject ? t.toObject() : t;
      if (!tripObj.estimatedDistance || tripObj.estimatedDistance === 120) {
        tripObj.estimatedDistance = calculateDistance(tripObj.startLocation, tripObj.endLocation);
      }
      if (!tripObj.actualDistance || tripObj.actualDistance === 120) {
        tripObj.actualDistance = calculateDistance(tripObj.startLocation, tripObj.endLocation);
      }
      return tripObj;
    });

    return sendSuccess(res, 200, processedTrips, 'Trips fetched');
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
    // Ownership check
    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
    }

    const tripObj = trip.toObject ? trip.toObject() : trip;
    if (!tripObj.estimatedDistance || tripObj.estimatedDistance === 120) {
      tripObj.estimatedDistance = calculateDistance(tripObj.startLocation, tripObj.endLocation);
    }
    if (!tripObj.actualDistance || tripObj.actualDistance === 120) {
      tripObj.actualDistance = calculateDistance(tripObj.startLocation, tripObj.endLocation);
    }

    return sendSuccess(res, 200, tripObj, 'Trip details fetched');
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
      status = 'Scheduled',
      description,
      cargoType,
      cargoWeight,
      tripNotes,
      estimatedDistance
    } = req.body;

    if (!tripNumber || !vehicle || !driver || !startLocation || !endLocation || !departureTime || !eta) {
      return sendError(res, 400, 'Trip number, vehicle, driver, route, and timing details are required');
    }

    // Validation: Pickup and Destination cannot be the same
    if (startLocation.trim().toLowerCase() === endLocation.trim().toLowerCase()) {
      return sendError(res, 400, 'Pickup Location and Destination cannot be the same');
    }

    // Validation: Departure Date cannot be in the past
    const pickupDate = new Date(departureTime);
    const currentDate = new Date();
    // Allow a small grace margin of 5 minutes for latency
    if (pickupDate.getTime() + 300000 < currentDate.getTime()) {
      return sendError(res, 400, 'Departure Time cannot be in the past.');
    }

    const etaDate = new Date(eta);
    if (etaDate.getTime() <= pickupDate.getTime()) {
      return sendError(res, 400, 'Estimated Arrival (ETA) must be later than the Departure Time.');
    }

    // A. Verify vehicle details & availability in database
    const selectedVeh = await Vehicle.findById(vehicle);
    if (!selectedVeh) {
      return sendError(res, 404, 'Vehicle not found');
    }
    if (selectedVeh.currentStatus !== 'Available' && selectedVeh.currentStatus !== 'Active') {
      return sendError(res, 400, 'Selected vehicle is no longer available');
    }

    const activeTripsWithVehicle = await Trip.findOne({
      vehicle,
      status: { $in: ['Scheduled', 'Assigned', 'In Progress'] }
    });
    if (activeTripsWithVehicle) {
      return sendError(res, 400, 'This vehicle is already allocated to another active trip');
    }

    // Verify selected vehicle is from the start location
    const cleanStart = startLocation.trim().split(/[\s,]+/)[0].toLowerCase();
    const vehicleLoc = (selectedVeh.currentLocation || selectedVeh.branch || 'Pune').trim().split(/[\s,]+/)[0].toLowerCase();
    if (!vehicleLoc.includes(cleanStart) && !cleanStart.includes(vehicleLoc)) {
      return sendError(res, 400, `Selected vehicle is not from the Start Location (${startLocation})`);
    }

    // B. Verify driver license, availability & branch in database
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return sendError(res, 404, 'Driver not found');
    }
    if (driverDoc.driverStatus !== 'AVAILABLE') {
      return sendError(res, 400, 'Selected driver is no longer available');
    }
    if (driverDoc.licenseExpiry && new Date(driverDoc.licenseExpiry) < currentDate) {
      return sendError(res, 400, 'Cannot assign driver with an expired license');
    }

    const activeTripsWithDriver = await Trip.findOne({
      driver,
      status: { $in: ['Scheduled', 'Assigned', 'In Progress'] }
    });
    if (activeTripsWithDriver) {
      return sendError(res, 400, 'This driver is already allocated to another active trip');
    }

    const driverLocVal = (driverDoc.currentLocation || driverDoc.driverLocation || driverDoc.branch || 'Pune').trim().split(/[\s,]+/)[0].toLowerCase();
    if (!driverLocVal.includes(cleanStart) && !cleanStart.includes(driverLocVal)) {
      return sendError(res, 400, `Selected driver is not from the Start Location (${startLocation})`);
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
      cargoType,
      cargoWeight: Number(cargoWeight) || 0,
      tripNotes,
      estimatedDistance: Number(estimatedDistance) || calculateDistance(startLocation, endLocation),
      assignedManager: req.user._id
    });

    // D. Update vehicle status in MongoDB
    const nextVehStatus = status === 'In Progress' ? 'On Trip' : 'Assigned';
    await Vehicle.findByIdAndUpdate(vehicle, {
      currentStatus: nextVehStatus,
      assignedDriver: driver
    });

    // E. Update driver status in MongoDB
    const nextDrvStatus = status === 'In Progress' ? 'ON_TRIP' : 'ASSIGNED';
    await Driver.findByIdAndUpdate(driver, {
      driverStatus: nextDrvStatus,
      assignedVehicle: selectedVeh ? selectedVeh.vehicleNumber : 'Unassigned'
    });

    // F. Automatically generate unique invoice and save to database
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
    const seq = String(count + 1).padStart(4, '0');
    const invoiceNumber = `INV-${datePart}-${seq}`;

    const invoice = new Invoice({
      invoiceNumber,
      invoiceDate: new Date(),
      trip: trip._id,
      driver: trip.driver,
      vehicle: trip.vehicle,
      createdBy: req.user._id
    });
    await invoice.save();

    return sendSuccess(res, 201, trip, 'Trip created and invoice generated successfully');
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

    // Ownership check
    if (String(existingTrip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
    }

    // Validation: Cannot modify a completed trip
    if (existingTrip.status === 'Completed') {
      return sendError(res, 400, 'Cannot modify a completed trip');
    }

    // Validation: Date and Time validation
    const depTime = req.body.departureTime !== undefined ? req.body.departureTime : existingTrip.departureTime;
    const etaTime = req.body.eta !== undefined ? req.body.eta : existingTrip.eta;

    if (depTime) {
      const depDate = new Date(depTime);
      const currentDate = new Date();
      if (req.body.departureTime !== undefined && depDate.getTime() + 300000 < currentDate.getTime()) {
        return sendError(res, 400, 'Departure Time cannot be in the past.');
      }

      if (etaTime) {
        const etaDate = new Date(etaTime);
        if (etaDate.getTime() <= depDate.getTime()) {
          return sendError(res, 400, 'Estimated Arrival (ETA) must be later than the Departure Time.');
        }
      }
    }

    const newStatus = req.body.status;

    // Validation: Prevent starting a trip without both vehicle and driver
    if (newStatus === 'In Progress' && (!existingTrip.vehicle || !existingTrip.driver)) {
      return sendError(res, 400, 'Cannot start a trip without both an assigned vehicle and driver');
    }

    // Validation: Prevent ending a trip that has not started
    if (newStatus === 'Completed' && existingTrip.status !== 'In Progress') {
      return sendError(res, 400, 'Cannot end a trip that is not currently in progress');
    }

    // Handle Start Trip / End Trip specific fields automatically
    if (newStatus === 'In Progress') {
      req.body.actualStartTime = new Date();
    } else if (newStatus === 'Completed') {
      req.body.actualEndTime = new Date();
      req.body.actualDistance = req.body.actualDistance || existingTrip.estimatedDistance || calculateDistance(existingTrip.startLocation, existingTrip.endLocation);
    }

    const updatedTrip = await updateTripInRepo(tripId, req.body);

    if (newStatus) {
      if (newStatus === 'Completed' || newStatus === 'Cancelled') {
        // Release vehicle
        if (updatedTrip.vehicle) {
          const vehicleUpdate = {
            currentStatus: 'Available',
            assignedDriver: null
          };
          if (newStatus === 'Completed') {
            vehicleUpdate.branch = updatedTrip.endLocation;
            vehicleUpdate.currentLocation = updatedTrip.endLocation;
          }
          await Vehicle.findByIdAndUpdate(updatedTrip.vehicle, vehicleUpdate);
        }
        // Release driver
        if (updatedTrip.driver) {
          const driverUpdate = {
            driverStatus: 'AVAILABLE',
            assignedVehicle: 'Unassigned'
          };
          if (newStatus === 'Completed') {
            driverUpdate.driverLocation = updatedTrip.endLocation;
            driverUpdate.currentLocation = updatedTrip.endLocation;
          }
          await Driver.findByIdAndUpdate(updatedTrip.driver, driverUpdate);
        }
      } else if (newStatus === 'In Progress') {
        // Set statuses to On Trip / ON_TRIP
        if (updatedTrip.vehicle) {
          await Vehicle.findByIdAndUpdate(updatedTrip.vehicle, {
            currentStatus: 'On Trip',
            assignedDriver: updatedTrip.driver
          });
        }
        if (updatedTrip.driver) {
          const selectedVeh = await Vehicle.findById(updatedTrip.vehicle);
          await Driver.findByIdAndUpdate(updatedTrip.driver, {
            driverStatus: 'ON_TRIP',
            assignedVehicle: selectedVeh ? selectedVeh.vehicleNumber : 'Unassigned'
          });
        }
      } else {
        // Scheduled or Assigned
        if (updatedTrip.vehicle) {
          await Vehicle.findByIdAndUpdate(updatedTrip.vehicle, {
            currentStatus: 'Assigned',
            assignedDriver: updatedTrip.driver
          });
        }
        if (updatedTrip.driver) {
          const selectedVeh = await Vehicle.findById(updatedTrip.vehicle);
          await Driver.findByIdAndUpdate(updatedTrip.driver, {
            driverStatus: 'ASSIGNED',
            assignedVehicle: selectedVeh ? selectedVeh.vehicleNumber : 'Unassigned'
          });
        }
      }
    }

    const finalTrip = await Trip.findById(tripId).populate('vehicle').populate('driver');
    return sendSuccess(res, 200, finalTrip, 'Trip updated');
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

    // Ownership check
    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
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
    // 1. Fetch total vehicles assigned to this manager
    const managerVehicles = await Vehicle.find({ assignedManager: req.user._id }, '_id');
    const vehicleIds = managerVehicles.map(v => v._id);

    // 2. Filter fuel entries by manager's vehicles
    const filter = { vehicle: { $in: vehicleIds } };
    if (req.query.vehicle) {
      filter.vehicle = req.query.vehicle;
    }
    const records = await getFuelRecords(filter);
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
    // Ownership check via vehicle's assignedManager
    if (record.vehicle && String(record.vehicle.assignedManager || record.vehicle) !== String(req.user._id)) {
      const managerVehicles = await Vehicle.find({ assignedManager: req.user._id }, '_id');
      const managerVehicleIds = managerVehicles.map(v => String(v._id));
      if (!managerVehicleIds.includes(String(record.vehicle._id || record.vehicle))) {
        return sendError(res, 403, 'Access denied: this fuel record belongs to another manager');
      }
    }
    return sendSuccess(res, 200, record, 'Fuel record details fetched');
  } catch (error) {
    next(error);
  }
};

export const createFuelRecord = async (req, res, next) => {
  try {
    return sendError(res, 403, 'Managers are not authorized to create new fuel entries.');
  } catch (error) {
    next(error);
  }
};

export const updateFuelRecord = async (req, res, next) => {
  try {
    const allowedKeys = ['status', 'resolutionComment', 'approvalStatus', 'rejectionReason', 'billStatus'];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(key => allowedKeys.includes(key));
    
    if (!isValidUpdate) {
      return sendError(res, 403, 'Managers are not authorized to edit driver fuel logs.');
    }

    // Automatically stamp approvedBy/rejectedBy and timestamps if status changes
    if (req.body.approvalStatus) {
      if (req.body.approvalStatus === 'Approved') {
        req.body.approvedBy = req.user.name || 'Fleet Manager';
        req.body.approvedAt = new Date();
        req.body.billStatus = 'Approved';
      } else if (req.body.approvalStatus === 'Rejected') {
        req.body.rejectedBy = req.user.name || 'Fleet Manager';
        req.body.rejectedAt = new Date();
        req.body.billStatus = 'Rejected';
      }
    }

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
    return sendError(res, 403, 'Managers are not authorized to delete driver fuel logs.');
  } catch (error) {
    next(error);
  }
};

// Maintenance Controllers
export const listMaintenance = async (req, res, next) => {
  try {
    const filter = { recordedBy: req.user._id };
    if (req.query.vehicle) {
      filter.vehicle = req.query.vehicle;
    }
    const maintenance = await getMaintenances(filter);
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
    // Ownership check
    if (String(maintenance.recordedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this maintenance record belongs to another manager');
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
    // Ownership check before update
    const existingMaint = await getMaintenanceById(req.params.id);
    if (!existingMaint) return sendError(res, 404, 'Maintenance not found');
    if (String(existingMaint.recordedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this maintenance record belongs to another manager');
    }

    const maintenance = await updateMaintenanceInRepo(req.params.id, req.body);
    if (!maintenance) {
      return sendError(res, 404, 'Maintenance not found');
    }
    if (maintenance.status === 'Completed') {
      await logActivity({
        title: 'Maintenance Completed',
        description: `Maintenance for vehicle ${maintenance.vehicleId || 'Unassigned'} (${maintenance.serviceType}) is completed.`,
        activityType: 'MAINTENANCE_COMPLETED',
        user: req.user,
        assignedManager: req.user._id
      });
    }

    return sendSuccess(res, 200, maintenance, 'Maintenance updated');
  } catch (error) {
    next(error);
  }
};

export const deleteMaintenance = async (req, res, next) => {
  try {
    // Ownership check before delete
    const existingMaint = await getMaintenanceById(req.params.id);
    if (!existingMaint) return sendError(res, 404, 'Maintenance not found');
    if (String(existingMaint.recordedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this maintenance record belongs to another manager');
    }

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
    // Ownership check
    if (String(document.uploadedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this document belongs to another manager');
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

    await logActivity({
      title: 'Document Uploaded',
      description: `Document "${document.title}" (${document.type}) was uploaded successfully.`,
      activityType: 'DOCUMENT_UPLOADED',
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, document, 'Document uploaded');
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    // Ownership check before update
    const existingDoc = await getDocumentById(req.params.id);
    if (!existingDoc) return sendError(res, 404, 'Document not found');
    if (String(existingDoc.uploadedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this document belongs to another manager');
    }

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
    // Ownership check before delete
    const existingDoc = await getDocumentById(req.params.id);
    if (!existingDoc) return sendError(res, 404, 'Document not found');
    if (String(existingDoc.uploadedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this document belongs to another manager');
    }

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
    // Ownership check
    if (String(report.generatedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this report belongs to another manager');
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
    // Ownership check before update
    const existingReport = await getReportById(req.params.id);
    if (!existingReport) return sendError(res, 404, 'Report not found');
    if (String(existingReport.generatedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this report belongs to another manager');
    }

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
    // Ownership check before delete
    const existingReport = await getReportById(req.params.id);
    if (!existingReport) return sendError(res, 404, 'Report not found');
    if (String(existingReport.generatedBy) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this report belongs to another manager');
    }

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
    const managerId = req.user._id;
    // Only vehicles belonging to the logged-in manager
    const vehicles = await Vehicle.find({ assignedManager: managerId }).populate('assignedDriver').sort({ createdAt: -1 });
    // Only trips belonging to the logged-in manager
    const trips = await Trip.find({
      assignedManager: managerId,
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

// Notifications Controllers
export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await getManagerNotifications(req.user._id);
    return sendSuccess(res, 200, notifications, 'Notifications fetched');
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
    // Always scope to the logged-in manager — never return another manager's bills
    const bills = await EWayBill.find({ assignedManager: req.user._id }).sort({ createdAt: -1 });
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

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await markManagerNotificationRead(req.params.id);
    if (!notification) return sendError(res, 404, 'Notification not found');
    
    // Emit notification:read event
    if (req.io) {
      req.io.to(`manager:${req.user._id}`).emit('notification:read', notification);
    }
    
    return sendSuccess(res, 200, notification, 'Notification marked as read');
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

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await markAllManagerNotificationsRead(req.user._id);
    
    // Emit notification:update event
    if (req.io) {
      req.io.to(`manager:${req.user._id}`).emit('notification:update', { allRead: true });
    }
    
    return sendSuccess(res, 200, null, 'All notifications marked as read');
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

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await deleteManagerNotification(req.params.id);
    if (!notification) return sendError(res, 404, 'Notification not found');
    
    // Emit notification:delete event
    if (req.io) {
      req.io.to(`manager:${req.user._id}`).emit('notification:delete', { id: req.params.id });
    }
    
    return sendSuccess(res, 200, null, 'Notification deleted');
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

export const listActivities = async (req, res, next) => {
  try {
    const managerId = req.user._id;

    const activities = await ActivityLog.find({ assignedManager: managerId })
      .sort({ createdAt: -1 })
      .limit(10);

    return sendSuccess(res, 200, activities, 'Activities fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getInvoiceByTripId = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    let invoice = await Invoice.findOne({ trip: tripId })
      .populate({
        path: 'trip',
        populate: [
          { path: 'driver' },
          { path: 'vehicle' }
        ]
      })
      .populate('driver')
      .populate('vehicle')
      .populate('createdBy', 'fullName email username');

    // Safe dynamic auto-generation fallback if invoice is missing for any reason
    if (!invoice) {
      const trip = await Trip.findById(tripId);
      if (!trip) {
        return sendError(res, 404, 'Trip not found');
      }

      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
      const seq = String(count + 1).padStart(4, '0');
      const invoiceNumber = `INV-${datePart}-${seq}`;

      const newInvoice = new Invoice({
        invoiceNumber,
        invoiceDate: new Date(),
        trip: trip._id,
        driver: trip.driver,
        vehicle: trip.vehicle,
        createdBy: req.user._id
      });
      await newInvoice.save();

      invoice = await Invoice.findById(newInvoice._id)
        .populate({
          path: 'trip',
          populate: [
            { path: 'driver' },
            { path: 'vehicle' }
          ]
        })
        .populate('driver')
        .populate('vehicle')
        .populate('createdBy', 'fullName email username');
    }

    return sendSuccess(res, 200, invoice, 'Invoice fetched successfully');
  } catch (error) {
    next(error);
  }
};

// Trip Milestone Review Controllers
export const getPendingMilestone = async (req, res, next) => {
  try {
    const managerId = req.user._id;

    // 1. Get count of completed trips for this manager
    const completedTrips = await Trip.countDocuments({
      assignedManager: managerId,
      status: 'Completed'
    });

    // 2. Find or create the ManagerMilestone document
    let milestoneDoc = await ManagerMilestone.findOne({ managerId });
    if (!milestoneDoc) {
      milestoneDoc = new ManagerMilestone({ managerId });
      await milestoneDoc.save();
    }

    const milestones = [10, 50, 100];
    let pendingMilestone = null;

    // Check each milestone in order
    for (const M of milestones) {
      const mState = milestoneDoc.tripMilestones[String(M)];
      if (!mState) continue;
      
      if (mState.reviewSubmitted) {
        continue;
      }

      // Initialize nextPopupTrip if completedTrips reached milestone but nextPopupTrip is still 0
      if (completedTrips >= M && mState.nextPopupTrip === 0) {
        mState.nextPopupTrip = M;
        milestoneDoc.markModified('tripMilestones');
        await milestoneDoc.save();
      }

      // Evaluate trigger conditions using nextPopupTrip:
      // Phase 1: completedTrips >= M && nextPopupTrip === M && reminderCount === 0
      // Phase 2: completedTrips >= M + 1 && nextPopupTrip === M + 1 && reminderCount === 1
      // Phase 3: completedTrips >= M + 2 && nextPopupTrip === M + 2 && reminderCount === 2
      const isPhase1 = (completedTrips >= M && mState.nextPopupTrip === M && mState.reminderCount === 0);
      const isPhase2 = (completedTrips >= M + 1 && mState.nextPopupTrip === M + 1 && mState.reminderCount === 1);
      const isPhase3 = (completedTrips >= M + 2 && mState.nextPopupTrip === M + 2 && mState.reminderCount === 2);

      const popupShouldOpen = isPhase1 || isPhase2 || isPhase3;

      if (!popupShouldOpen) {
        // Skip
      } else {
        const isMandatory = isPhase3;
        
        // Skip optional phases if they were already triggered for this exact trip count
        if (!isMandatory && mState.lastTripTriggered === completedTrips) {
          continue;
        }

        // Set lastTripTriggered to completedTrips to prevent repeat showing on reload
        if (mState.lastTripTriggered !== completedTrips) {
          mState.lastTripTriggered = completedTrips;
          milestoneDoc.markModified('tripMilestones');
          await milestoneDoc.save();
        }

        pendingMilestone = {
          milestone: M,
          isMandatory,
          reminderCount: mState.reminderCount,
          completedTrips
        };
        break; // Show lowest pending milestone first
      }
    }

    return sendSuccess(res, 200, pendingMilestone, 'Pending milestone check complete');
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const { rating, reviewText, milestone } = req.body;

    if (!rating || !reviewText || !milestone) {
      return sendError(res, 400, 'Rating, reviewText, and milestone are required');
    }

    const valRating = Number(rating);
    if (isNaN(valRating) || valRating < 1 || valRating > 5) {
      return sendError(res, 400, 'Rating must be a number between 1 and 5');
    }

    const cleanReview = String(reviewText).trim();
    if (cleanReview.length < 20 || cleanReview.length > 500) {
      return sendError(res, 400, 'Review text must be between 20 and 500 characters');
    }

    const M = Number(milestone);
    if (![10, 50, 100].includes(M)) {
      return sendError(res, 400, 'Milestone must be 10, 50, or 100');
    }

    const managerId = req.user._id;

    // Save review
    const review = new Review({
      managerId,
      managerName: req.user.name || req.user.email || 'Fleet Manager',
      rating: valRating,
      reviewText: cleanReview,
      tripMilestone: M
    });
    await review.save();

    // Mark milestone as submitted
    let milestoneDoc = await ManagerMilestone.findOne({ managerId });
    if (!milestoneDoc) {
      milestoneDoc = new ManagerMilestone({ managerId });
    }

    const mState = milestoneDoc.tripMilestones[String(M)];
    if (mState) {
      mState.reviewSubmitted = true;
      milestoneDoc.markModified('tripMilestones');
      await milestoneDoc.save();
    }

    return sendSuccess(res, 201, review, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const maybeLater = async (req, res, next) => {
  try {
    const { milestone } = req.body;
    const M = Number(milestone);

    if (![10, 50, 100].includes(M)) {
      return sendError(res, 400, 'Milestone must be 10, 50, or 100');
    }

    const managerId = req.user._id;
    let milestoneDoc = await ManagerMilestone.findOne({ managerId });
    if (milestoneDoc) {
      const mState = milestoneDoc.tripMilestones[String(M)];
      if (mState) {
        if (mState.reminderCount === 0) {
          mState.reminderCount = 1;
          mState.nextPopupTrip = M + 1; // e.g. 11
        } else if (mState.reminderCount === 1) {
          mState.reminderCount = 2;
          mState.nextPopupTrip = M + 2; // e.g. 12
        } else {
          mState.reminderCount = 2;
          mState.nextPopupTrip = M + 2;
        }

        milestoneDoc.markModified('tripMilestones');
        await milestoneDoc.save();
      }
    }

    return sendSuccess(res, 200, null, 'Milestone dismissed for now');
  } catch (error) {
    next(error);
  }
};
