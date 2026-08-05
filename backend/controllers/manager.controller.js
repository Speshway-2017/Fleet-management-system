import mongoose from 'mongoose';
import { geocodeCity } from '../utils/geocodingHelper.js';
export { getDriverStats } from './driver.controller.js';
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
import { calculateTripFinance } from '../utils/earningsCalculator.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Notification from '../models/Notification.js';
import EWayBill from '../models/EWayBill.js';
import TripChat from '../models/TripChat.js';
import CallHistory from '../models/CallHistory.js';
import Fuel from '../models/Fuel.js';
import ActivityLog from '../models/ActivityLog.js';
import Invoice from '../models/Invoice.js';
import PlatformIssue from '../models/PlatformIssue.js';
import ProofOfDelivery from '../models/ProofOfDelivery.js';
import WeighbridgeSlip from '../models/WeighbridgeSlip.js';
import Review from '../models/Review.js';
import ManagerMilestone from '../models/ManagerMilestone.js';
import { generateEmployeeId, generateTempPassword } from '../utils/driverAuthHelper.js';
import { hashPassword } from '../utils/hashPassword.js';
import { logActivity } from '../utils/activityLogger.js';
import { calculateDistance } from '../utils/distanceCalculator.js';
import TollTransaction from '../models/TollTransaction.js';
import { generateTollsForTrip } from '../utils/seedTolls.js';
import VehicleComplaint from '../models/VehicleComplaint.js';
import { syncDriverLocationFromLatestTrip, updateDriverAndVehicleOnCompletion } from '../utils/driverLocationHelper.js';
import { processFastagDeduction } from '../services/fastag.service.js';

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

    // 6. Total Earnings: sum up revenues from all trips to match earnings page
    const trips = await Trip.find({ assignedManager: managerId });
    const earningsSum = trips.reduce((acc, trip) => {
      const { revenue } = calculateTripFinance(trip);
      return acc + revenue;
    }, 0);

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

    const vehicleId = req.params.id;
    console.log(`\n=================================`);
    console.log(`Updating Vehicle\n`);
    console.log(`Vehicle ID:\n${vehicleId}\n`);

    const excludeIdQuery = mongoose.Types.ObjectId.isValid(vehicleId)
      ? new mongoose.Types.ObjectId(vehicleId)
      : vehicleId;

    // 1. Check duplicate chassis
    if (updateData.chassisNumber && String(updateData.chassisNumber).trim() && String(updateData.chassisNumber).trim().toUpperCase() !== 'N/A') {
      const trimmedChassis = String(updateData.chassisNumber).trim();
      console.log(`Checking duplicate chassis...\n`);

      const dupChassis = await Vehicle.findOne({
        chassisNumber: trimmedChassis,
        _id: { $ne: excludeIdQuery }
      });

      if (dupChassis && String(dupChassis._id) !== String(vehicleId)) {
        console.log(`Duplicate chassis number found.\n`);
        console.log(`Existing Vehicle ID:\n${dupChassis._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this chassis number already exists');
      }
      console.log(`✓ Current vehicle ignored\n`);
    }

    // 2. Check duplicate registration number
    if (updateData.registrationNumber && String(updateData.registrationNumber).trim() && String(updateData.registrationNumber).trim().toUpperCase() !== 'N/A') {
      const trimmedRegNum = String(updateData.registrationNumber).trim().toUpperCase();
      console.log(`Checking duplicate registration number...\n`);

      const dupRegNum = await Vehicle.findOne({
        registrationNumber: trimmedRegNum,
        _id: { $ne: excludeIdQuery }
      });

      if (dupRegNum && String(dupRegNum._id) !== String(vehicleId)) {
        console.log(`Duplicate registration number found.\n`);
        console.log(`Existing Vehicle ID:\n${dupRegNum._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this registration number already exists');
      }
      console.log(`✓ No duplicate found\n`);
    }

    // 3. Check duplicate registration plate (vehicleNumber)
    const targetPlate = (updateData.vehicleNumber || updateData.plateNumber || '').toString().trim().toUpperCase();
    if (targetPlate && targetPlate !== 'N/A') {
      console.log(`Checking duplicate registration plate...\n`);

      const dupPlate = await Vehicle.findOne({
        vehicleNumber: targetPlate,
        _id: { $ne: excludeIdQuery }
      });

      if (dupPlate && String(dupPlate._id) !== String(vehicleId)) {
        console.log(`Duplicate registration plate found.\n`);
        console.log(`Existing Vehicle ID:\n${dupPlate._id}\n`);
        console.log(`Update aborted.\n`);
        console.log(`=================================\n`);
        return sendError(res, 409, 'A vehicle with this registration plate already exists');
      }
      console.log(`✓ No duplicate found\n`);
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

    console.log(`Updating vehicle...\n`);
    const vehicle = await updateVehicleInRepo(req.params.id, updateData);
    console.log(`✓ Vehicle updated successfully\n`);
    console.log(`=================================\n`);
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
    let driver = await getDriverById(req.params.id);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
    // Ownership check
    const managerId = driver.assignedManager?._id || driver.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
    }
    await syncDriverLocationFromLatestTrip(driver);
    return sendSuccess(res, 200, driver, 'Driver details fetched');
  } catch (error) {
    next(error);
  }
};

export const createDriver = async (req, res, next) => {
  const driverName = req.body.fullName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim() || req.body.name || 'New Driver';
  console.log(`\n==================================================`);
  console.log(`Creating Driver...`);
  console.log(`==================================================\n`);
  console.log(`Driver Name:\n${driverName}\n`);

  try {
    const {
      firstName,
      lastName,
      name,
      fullName,
      email,
      phone,
      phoneNumber,
      mobile,
      licenseNumber,
      licenseType,
      licenseExpiry,
      assignedVehicle,
      status,
      driverStatus,
      dob,
      gender,
      experience,
      joiningDate,
      address,
      city,
      state,
      pincode,
      documents,
      licenseDocument
    } = req.body;

    const finalEmail = (email || '').trim().toLowerCase();
    const finalPhone = (mobile || phoneNumber || phone || '').trim();
    const finalLicense = (licenseNumber || '').trim();
    const computedFullName = fullName || name || `${firstName || ''} ${lastName || ''}`.trim();

    if (!computedFullName || !finalEmail || !finalPhone || !finalLicense) {
      console.log(`Validation Failed: Name, email, mobile, and license number are required.`);
      return sendError(res, 400, 'Name, email, mobile number, and license number are required');
    }

    // 1. Check duplicate email
    console.log(`Checking duplicate email...`);
    const existingEmail = await Driver.findOne({ email: finalEmail });
    if (existingEmail) {
      console.log(`Duplicate Email Found\nEmail:\n${finalEmail}\nDriver creation aborted.`);
      return sendError(res, 400, `Duplicate Email Found: A driver with email '${finalEmail}' already exists.`);
    }
    console.log(`✓ Email Available\n`);

    // 2. Check duplicate mobile
    console.log(`Checking duplicate mobile...`);
    const existingMobile = await Driver.findOne({
      $or: [{ phoneNumber: finalPhone }, { mobile: finalPhone }]
    });
    if (existingMobile) {
      console.log(`Duplicate Mobile Number Found\nDriver creation aborted.`);
      return sendError(res, 400, `Duplicate Mobile Number Found: A driver with mobile number '${finalPhone}' already exists.`);
    }
    console.log(`✓ Mobile Available\n`);

    // 3. Check duplicate license
    console.log(`Checking duplicate license...`);
    const existingLicense = await Driver.findOne({ licenseNumber: finalLicense });
    if (existingLicense) {
      console.log(`Duplicate License Number Found\nDriver creation aborted.`);
      return sendError(res, 400, `Duplicate License Number Found: A driver with license number '${finalLicense}' already exists.`);
    }
    console.log(`✓ License Available\n`);

    // 4. Generate Employee ID
    console.log(`Generating Employee ID...`);
    const generatedEmpId = await generateEmployeeId();
    console.log(`✓ ${generatedEmpId}\n`);

    // 5. Generate Temporary Password
    console.log(`Generating Temporary Password...`);
    const temporaryPassword = generateTempPassword();
    console.log(`✓ Generated Successfully\n`);

    // 6. Hash Password
    console.log(`Hashing Password...`);
    const hashedPassword = await hashPassword(temporaryPassword);
    console.log(`✓ Password Hashed Successfully\n`);

    console.log(`Saving Driver...`);
    const driver = await Driver.create({
      firstName: firstName || '',
      lastName: lastName || '',
      fullName: computedFullName,
      email: finalEmail,
      phoneNumber: finalPhone,
      mobile: finalPhone,
      licenseNumber: finalLicense,
      licenseType: licenseType || 'HMV',
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
      assignedVehicle: assignedVehicle || 'Unassigned',
      driverStatus: driverStatus || 'AVAILABLE',
      accountStatus: 'Active',
      status: status || 'Active',
      employeeId: generatedEmpId,
      password: hashedPassword,
      mustChangePassword: true,
      dob: dob ? new Date(dob) : undefined,
      gender: gender || 'Male',
      experience: experience || '',
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      address: address || '',
      city: city || '',
      state: state || '',
      pincode: pincode || '',
      documents: documents || {},
      licenseDocument: licenseDocument || '',
      assignedManager: req.user?._id
    });
    console.log(`✓ Driver Saved Successfully\n`);

    console.log(`==================================================`);
    console.log(`Driver Created Successfully`);
    console.log(`==================================================\n`);
    console.log(`Employee ID:\n${generatedEmpId}\n`);
    console.log(`Temporary Password:\n${temporaryPassword}\n`);
    console.log(`Status:\nActive\n`);
    console.log(`Must Change Password:\ntrue\n`);
    console.log(`==================================================\n`);

    await logActivity({
      title: 'Driver Created',
      description: `Driver ${driver.fullName} (${generatedEmpId}) registered under status Active.`,
      activityType: 'DRIVER_ASSIGNED',
      user: req.user,
      assignedManager: req.user?._id
    });

    return res.status(201).json({
      success: true,
      message: 'Driver created successfully.',
      employeeId: generatedEmpId,
      temporaryPassword,
      driver: {
        _id: driver._id,
        fullName: driver.fullName,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber,
        employeeId: driver.employeeId,
        status: driver.status,
        accountStatus: driver.accountStatus,
        mustChangePassword: driver.mustChangePassword
      }
    });
  } catch (error) {
    console.error(`Driver Creation Failed:`, error);
    if (error.code === 11000) {
      return sendError(res, 400, 'A driver with this email, mobile number, or license number already exists');
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
    await logActivity({
      title: 'Driver Deleted',
      description: `Driver ${driver.name} was deleted.`,
      activityType: 'DRIVER_ASSIGNED',
      user: req.user,
      assignedManager: req.user._id
    });
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

    // Map over trips and preserve exact stored distance from MongoDB
    const processedTrips = trips.map(t => {
      const tripObj = t.toObject ? t.toObject() : t;
      const storedDist = (tripObj.actualDistance && Number(tripObj.actualDistance) > 0)
        ? Number(tripObj.actualDistance)
        : ((tripObj.estimatedDistance && Number(tripObj.estimatedDistance) > 0)
            ? Number(tripObj.estimatedDistance)
            : calculateDistance(tripObj.startLocation, tripObj.endLocation));

      tripObj.distance = storedDist;
      tripObj.totalDistance = storedDist;
      if (!tripObj.estimatedDistance || Number(tripObj.estimatedDistance) <= 0) {
        tripObj.estimatedDistance = storedDist;
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

    // Dynamically resolve proofOfDelivery from Trip schema or ProofOfDelivery collection
    const podDoc = (tripObj.proofOfDelivery && tripObj.proofOfDelivery.url) ? tripObj.proofOfDelivery : await ProofOfDelivery.findOne({ trip: trip._id });
    const podUrl = tripObj.proofOfDelivery?.url || podDoc?.podDocumentUrl || podDoc?.deliveryPhotoUrl;
    const resolvedPodStatus = podUrl ? (tripObj.podStatus === 'Approved' ? 'Approved' : 'Uploaded') : 'Not Uploaded';

    tripObj.podStatus = resolvedPodStatus;
    tripObj.proofOfDelivery = {
      url: podUrl || '',
      deliveryPhotoUrl: podDoc?.deliveryPhotoUrl || podUrl || '',
      customerSignatureUrl: podDoc?.customerSignatureUrl || '',
      customerName: podDoc?.customerName || '',
      receiverName: podDoc?.receiverName || '',
      status: resolvedPodStatus
    };

    // Dynamically resolve weighbridgeSlip from Trip schema or WeighbridgeSlip collection
    const wbDoc = (tripObj.weighbridgeSlip && tripObj.weighbridgeSlip.url) ? tripObj.weighbridgeSlip : await WeighbridgeSlip.findOne({ trip: trip._id });
    const wbUrl = tripObj.weighbridgeSlip?.url || wbDoc?.documentUrl;
    const resolvedWbStatus = wbUrl ? (tripObj.weighbridgeStatus === 'Approved' ? 'Approved' : 'Uploaded') : 'Not Uploaded';

    tripObj.weighbridgeStatus = resolvedWbStatus;
    tripObj.weighbridgeSlip = {
      url: wbUrl || '',
      documentUrl: wbUrl || '',
      grossWeight: wbDoc?.grossWeight || 0,
      tareWeight: wbDoc?.tareWeight || 0,
      netWeight: wbDoc?.netWeight || 0,
      location: wbDoc?.location || '',
      status: resolvedWbStatus
    };

    // Dynamically resolve tripInvoice
    if (!tripObj.tripInvoice || !tripObj.tripInvoice.url) {
      const invDoc = await Invoice.findOne({ trip: trip._id });
      if (invDoc) {
        tripObj.tripInvoice = {
          invoiceNumber: invDoc.invoiceNumber || `INV-${tripObj.tripNumber}`,
          url: invDoc.invoiceUrl || '',
          generatedAt: invDoc.createdAt
        };
      }
    }

    const storedDist = (tripObj.actualDistance && Number(tripObj.actualDistance) > 0)
      ? Number(tripObj.actualDistance)
      : ((tripObj.estimatedDistance && Number(tripObj.estimatedDistance) > 0)
          ? Number(tripObj.estimatedDistance)
          : calculateDistance(tripObj.startLocation, tripObj.endLocation));

    tripObj.distance = storedDist;
    tripObj.totalDistance = storedDist;
    if (!tripObj.estimatedDistance || Number(tripObj.estimatedDistance) <= 0) {
      tripObj.estimatedDistance = storedDist;
    }

    return sendSuccess(res, 200, tripObj, 'Trip details fetched');
  } catch (error) {
    next(error);
  }
};

export const getTripTolls = async (req, res, next) => {
  try {
    const tripId = req.params.tripId;
    const trip = await getTripById(tripId);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    // Ownership check
    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
    }

    const tolls = await TollTransaction.find({ trip: tripId }).sort({ dateTime: 1 });
    return sendSuccess(res, 200, tolls, 'Toll transactions fetched');
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
      pickupAddress,
      deliveryAddress,
      fromAddress,
      toAddress,
      departureTime,
      eta,
      status = 'Scheduled',
      description,
      cargoType,
      cargoWeight,
      tripNotes,
      estimatedDistance
    } = req.body;

    const finalPickupAddress = pickupAddress || fromAddress || {};
    const rawDelivery = deliveryAddress || toAddress || {};
    const finalDeliveryAddress = {
      ...rawDelivery,
      streetAddress: (rawDelivery.streetAddress || rawDelivery.street || rawDelivery.line1 || ''),
      area: (rawDelivery.area || rawDelivery.areaLocality || rawDelivery.locality || rawDelivery.landmark || ''),
      city: (rawDelivery.city || rawDelivery.town || ''),
      state: (rawDelivery.state || ''),
      pincode: (rawDelivery.pincode || rawDelivery.postalCode || rawDelivery.zipCode || ''),
      mobile: (rawDelivery.mobile || rawDelivery.mobileNumber || rawDelivery.phone || rawDelivery.phoneNumber || rawDelivery.contactPhone || req.body.receiverPhone || req.body.customerPhone || req.body.deliveryPhone || req.body.receiverMobile || req.body.customerMobile || '')
    };

    if (!tripNumber || !vehicle || !driver || !startLocation || !endLocation || !departureTime || !eta) {
      return sendError(res, 400, 'Trip number, vehicle, driver, route, and timing details are required');
    }

    // Validation: Pickup and Destination cannot be the same
    const normStart = startLocation.trim().split(',')[0].trim().toLowerCase();
    const normEnd = endLocation.trim().split(',')[0].trim().toLowerCase();
    if (normStart && normEnd && normStart === normEnd) {
      return sendError(res, 400, 'Trip cannot be created because the pickup and destination locations are the same.');
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

    const inProgressTripWithVehicle = await Trip.findOne({
      vehicle,
      status: { $in: ['In Progress', 'On Transit', 'Enroute', 'Reach Pickup', 'Pickup Completed'] }
    });
    if (inProgressTripWithVehicle) {
      return sendError(res, 400, 'This Vehicle is already assigned to an active trip in progress.');
    }

    // Cancel any stale/orphaned non-completed trips for this vehicle
    await Trip.updateMany(
      { vehicle, status: { $in: ['Assigned', 'Scheduled', 'Accepted'] } },
      { $set: { status: 'Cancelled', isActive: false } }
    ).catch(() => {});

    // B. Verify driver license and availability in database
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return sendError(res, 404, 'Driver not found');
    }
    if (driverDoc.driverStatus !== 'AVAILABLE') {
      return sendError(res, 400, 'This Driver is already assigned to an active trip.');
    }
    if (driverDoc.licenseExpiry && new Date(driverDoc.licenseExpiry) < currentDate) {
      return sendError(res, 400, 'Cannot assign driver with an expired license');
    }

    const inProgressTripWithDriver = await Trip.findOne({
      driver,
      status: { $in: ['In Progress', 'On Transit', 'Enroute', 'Reach Pickup', 'Pickup Completed'] }
    });
    if (inProgressTripWithDriver) {
      return sendError(res, 400, 'This Driver is already assigned to an active trip in progress.');
    }

    // Cancel any stale/orphaned non-completed trips for this driver
    await Trip.updateMany(
      { driver, status: { $in: ['Assigned', 'Scheduled', 'Accepted'] } },
      { $set: { status: 'Cancelled', isActive: false } }
    ).catch(() => {});

    console.log(`\nCreating Trip...`);
    console.log(`Saving Pickup Address...`);
    console.log(`✓ Pickup Address Saved`);
    console.log(`Saving Delivery Address...`);
    console.log(`✓ Delivery Address Saved`);

    // C. Create the trip with status "Pending Driver Acceptance"
    const initialStatus = 'Pending Driver Acceptance';
    const trip = await createTripInRepo({
      tripNumber,
      vehicle,
      driver,
      driverName: driverName || driverDoc.fullName || '',
      driverPhone: driverPhone || driverDoc.phoneNumber || '',
      vehicleName: vehicleName || selectedVeh.vehicleName || '',
      vehiclePlate: vehiclePlate || selectedVeh.vehicleNumber || '',
      startLocation,
      endLocation,
      pickupAddress: finalPickupAddress,
      deliveryAddress: finalDeliveryAddress,
      fromAddress: finalPickupAddress,
      toAddress: finalDeliveryAddress,
      departureTime,
      eta,
      status: initialStatus,
      isActive: true,
      description,
      cargoType,
      cargoWeight: Number(cargoWeight) || 0,
      tripNotes,
      estimatedDistance: Number(estimatedDistance) || calculateDistance(startLocation, endLocation),
      assignedManager: req.user._id
    });

    console.log(`Trip Created Successfully with status 'Pending Driver Acceptance'`);

    // Auto-generate Invoice document in MongoDB upon trip creation
    try {
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await Invoice.countDocuments({ invoiceNumber: { $regex: new RegExp('^INV-' + datePart) } });
      const seq = String(count + 1).padStart(4, '0');
      const autoInvoiceNumber = `INV-${datePart}-${seq}`;

      const newInvoice = new Invoice({
        invoiceNumber: autoInvoiceNumber,
        invoiceDate: new Date(),
        trip: trip._id,
        driver: trip.driver,
        vehicle: trip.vehicle,
        createdBy: req.user._id
      });
      await newInvoice.save();

      trip.tripInvoice = {
        invoiceId: newInvoice._id,
        invoiceNumber: newInvoice.invoiceNumber,
        url: newInvoice.pdfUrl || '',
        generatedAt: newInvoice.createdAt || newInvoice.invoiceDate
      };
      await trip.save();
      console.log(`✓ Invoice #${autoInvoiceNumber} generated automatically for Trip #${tripNumber}`);
    } catch (invErr) {
      console.error(`Auto invoice generation notice: ${invErr.message}`);
    }

    // D. Update vehicle status and location in MongoDB
    await Vehicle.findByIdAndUpdate(vehicle, {
      currentStatus: 'Assigned',
      assignedDriver: driver,
      currentLocation: startLocation,
      branch: startLocation,
      branchDepot: startLocation,
      isAssigned: true,
      activeTripId: trip._id,
      currentTripId: trip._id
    });

    // E. Update driver status and location in MongoDB
    await Driver.findByIdAndUpdate(driver, {
      driverStatus: 'ASSIGNED',
      assignedVehicle: selectedVeh ? (selectedVeh.vehicleNumber || selectedVeh.registrationNumber || selectedVeh.vehicleName) : 'Unassigned',
      currentLocation: startLocation,
      driverLocation: startLocation,
      branch: startLocation,
      isAssigned: true,
      activeTripId: trip._id,
      currentTripId: trip._id
    });

    // F. Emit socket event and notification to assigned driver
    const io = req.io || req.app?.get?.('socketio') || req.app?.locals?.io;
    if (driver) {
      try {
        const vehPlate = selectedVeh ? (selectedVeh.vehicleNumber || selectedVeh.registrationNumber || selectedVeh.vehicleName || '') : '';
        await createAndEmitNotification({
          io,
          recipient: driver,
          sender: req.user._id,
          recipientRole: 'DRIVER',
          senderRole: 'FLEET_MANAGER',
          organization: driverDoc.organization || req.user.organization,
          type: 'trip_assigned',
          title: `New Trip Assignment: #${tripNumber}`,
          message: `Trip #${tripNumber} (${startLocation} ➔ ${endLocation}). Vehicle: ${vehPlate}, Departure: ${departureTime}, Cargo: ${cargoType || 'General'} (${cargoWeight || 0} kg). Please Accept or Reject this assignment in your app.`,
          priority: 'high',
          referenceId: trip._id,
          referenceType: 'Trip',
          metadata: {
            tripId: trip._id,
            tripNumber,
            pickup: startLocation,
            destination: endLocation,
            departureTime,
            vehicle: vehPlate,
            cargoType: cargoType || 'General',
            cargoWeight: cargoWeight || 0,
            status: 'Pending Driver Acceptance'
          }
        });

        if (io) {
          io.to(`driver:${driver}`).emit('trip:assigned', trip);
          io.to(`manager:${req.user._id}`).emit('trip:created', trip);
        }

        if (driverDoc.fcmToken) {
          console.log(`[FCM] Simulated push notification sent to FCM token ${driverDoc.fcmToken} for driver ${driverDoc.fullName}: "New Trip Assigned: Trip ${tripNumber}"`);
        }
      } catch (notifErr) {
        console.error('Failed to send assignment notification to driver:', notifErr);
      }
    }

    // G. Automatically generate unique invoice and save to database
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
    trip.tripInvoice = {
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      url: invoice.pdfUrl || '',
      generatedAt: invoice.createdAt || invoice.invoiceDate
    };
    await trip.save();
    console.log(`Invoice Generated for Trip ${trip.tripNumber}: ${invoice.invoiceNumber}\n`);

    // Generate Toll Transactions for the new trip
    try {
      await generateTollsForTrip(trip);
    } catch (tollErr) {
      console.error('Failed to generate toll transactions for new trip:', tollErr);
    }

    await logActivity({
      title: 'Trip Dispatched',
      description: `Trip ${trip.tripNumber} dispatched using Vehicle ${trip.vehiclePlate || ''}.`,
      activityType: 'TRIP_ASSIGNED',
      vehicleNumber: trip.vehiclePlate || '',
      vehicleName: trip.vehicleName || '',
      relatedModule: 'Trip',
      relatedId: trip._id,
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, trip, 'Trip created and assigned successfully');
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

    if (newStatus === 'Completed') {
      try {
        await processFastagDeduction(tripId);
      } catch (fastagErr) {
        return sendError(res, 400, fastagErr.message);
      }
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

    if (newStatus && newStatus !== existingTrip.status) {
      let title = `Trip ${newStatus}`;
      let description = `Trip ${finalTrip.tripNumber} ${newStatus.toLowerCase()} using Vehicle ${finalTrip.vehiclePlate || ''}.`;
      let activityType = newStatus === 'Completed' ? 'TRIP_COMPLETED' : (newStatus === 'In Progress' ? 'TRIP_STARTED' : 'TRIP_ASSIGNED');

      await logActivity({
        title,
        description,
        activityType,
        vehicleNumber: finalTrip.vehiclePlate || '',
        vehicleName: finalTrip.vehicleName || '',
        relatedModule: 'Trip',
        relatedId: finalTrip._id,
        user: req.user,
        assignedManager: req.user._id
      });
    } else {
      await logActivity({
        title: 'Trip Details Updated',
        description: `Trip ${finalTrip.tripNumber} details updated.`,
        activityType: 'TRIP_ASSIGNED',
        vehicleNumber: finalTrip.vehiclePlate || '',
        vehicleName: finalTrip.vehicleName || '',
        relatedModule: 'Trip',
        relatedId: finalTrip._id,
        user: req.user,
        assignedManager: req.user._id
      });
    }

    // Send notifications to the driver if operational fields or driver/status changed
    try {
      const ioInstance = req.app.get('socketio') || req.app.locals?.io;
      const targetDriverId = req.body.driver || existingTrip.driver;
      
      // If driver is changed
      if (req.body.driver && String(req.body.driver) !== String(existingTrip.driver)) {
        // Notify new driver
        const newDriverDoc = await Driver.findById(req.body.driver);
        if (newDriverDoc) {
          await createAndEmitNotification({
            io: ioInstance,
            recipient: req.body.driver,
            sender: req.user._id,
            recipientRole: 'DRIVER',
            senderRole: 'FLEET_MANAGER',
            organization: newDriverDoc.organization || req.user.organization,
            type: 'trip_assigned',
            title: 'New Trip Assigned',
            message: `You have been assigned trip #${finalTrip.tripNumber} (${finalTrip.startLocation} ➔ ${finalTrip.endLocation}). Please accept or reject this assignment in your app.`,
            priority: 'high',
            referenceId: finalTrip._id,
            referenceType: 'Trip',
            metadata: { tripId: finalTrip._id, tripNumber: finalTrip.tripNumber }
          });
        }

        // Notify old driver
        const oldDriverDoc = await Driver.findById(existingTrip.driver);
        if (oldDriverDoc) {
          await createAndEmitNotification({
            io: ioInstance,
            recipient: existingTrip.driver,
            sender: req.user._id,
            recipientRole: 'DRIVER',
            senderRole: 'FLEET_MANAGER',
            organization: oldDriverDoc.organization || req.user.organization,
            type: 'trip_cancelled',
            title: 'Trip Unassigned',
            message: `You have been unassigned from trip #${finalTrip.tripNumber}.`,
            priority: 'high',
            referenceId: finalTrip._id,
            referenceType: 'Trip',
            metadata: { tripId: finalTrip._id, tripNumber: finalTrip.tripNumber }
          });
        }
      } else if (targetDriverId) {
        // Detect Operational Field Changes for Driver
        const fieldChanges = [];
        
        if (req.body.departureTime !== undefined && String(req.body.departureTime) !== String(existingTrip.departureTime)) {
          fieldChanges.push(`Pickup Time changed from ${existingTrip.departureTime || 'N/A'} → ${req.body.departureTime}`);
        }
        if (req.body.eta !== undefined && String(req.body.eta) !== String(existingTrip.eta)) {
          fieldChanges.push(`ETA changed from ${existingTrip.eta || 'N/A'} → ${req.body.eta}`);
        }
        if (req.body.startLocation !== undefined && String(req.body.startLocation) !== String(existingTrip.startLocation)) {
          fieldChanges.push(`Pickup Location changed from ${existingTrip.startLocation || 'N/A'} → ${req.body.startLocation}`);
        }
        if (req.body.endLocation !== undefined && String(req.body.endLocation) !== String(existingTrip.endLocation)) {
          fieldChanges.push(`Destination changed from ${existingTrip.endLocation || 'N/A'} → ${req.body.endLocation}`);
        }
        if (req.body.vehicle !== undefined && String(req.body.vehicle) !== String(existingTrip.vehicle)) {
          fieldChanges.push(`Assigned Vehicle updated`);
        }
        if (req.body.cargoType !== undefined && String(req.body.cargoType) !== String(existingTrip.cargoType)) {
          fieldChanges.push(`Cargo Type changed to ${req.body.cargoType}`);
        }
        if (req.body.cargoWeight !== undefined && Number(req.body.cargoWeight) !== Number(existingTrip.cargoWeight)) {
          fieldChanges.push(`Cargo Weight changed to ${req.body.cargoWeight} kg`);
        }
        if (req.body.tripNotes !== undefined && String(req.body.tripNotes) !== String(existingTrip.tripNotes)) {
          fieldChanges.push(`Trip Notes updated`);
        }

        if (fieldChanges.length > 0) {
          const currentDriverDoc = await Driver.findById(targetDriverId);
          if (currentDriverDoc) {
            const formattedChanges = fieldChanges.join('\n• ');
            const notifMsg = `Your assigned trip #${finalTrip.tripNumber} has been updated by the Fleet Manager.\n• ${formattedChanges}\nPlease review the latest trip details before starting your journey.`;

            await createAndEmitNotification({
              io: ioInstance,
              recipient: targetDriverId,
              sender: req.user._id,
              recipientRole: 'DRIVER',
              senderRole: 'FLEET_MANAGER',
              organization: currentDriverDoc.organization || req.user.organization,
              type: 'trip_updated',
              title: 'Trip Schedule Updated',
              message: notifMsg,
              priority: 'high',
              referenceId: finalTrip._id,
              referenceType: 'Trip',
              metadata: {
                tripId: finalTrip._id,
                tripNumber: finalTrip.tripNumber,
                pickup: finalTrip.startLocation,
                destination: finalTrip.endLocation,
                departureTime: finalTrip.departureTime,
                eta: finalTrip.eta,
                changes: fieldChanges,
                status: finalTrip.status
              }
            });

            if (ioInstance) {
              ioInstance.to(`driver:${targetDriverId}`).emit('trip:updated', {
                tripId: finalTrip._id,
                tripNumber: finalTrip.tripNumber,
                trip: finalTrip,
                changes: fieldChanges,
                message: 'Trip details have been updated by your Fleet Manager.'
              });
            }
          }
        } else if (newStatus && newStatus !== existingTrip.status) {
          // Status changed on existing driver
          const currentDriverDoc = await Driver.findById(targetDriverId);
          if (currentDriverDoc) {
            await createAndEmitNotification({
              io: ioInstance,
              recipient: targetDriverId,
              sender: req.user._id,
              recipientRole: 'DRIVER',
              senderRole: 'FLEET_MANAGER',
              organization: currentDriverDoc.organization || req.user.organization,
              type: 'trip_status_changed',
              title: `Trip Status Updated`,
              message: `Your trip ${finalTrip.tripNumber} status is now ${newStatus}.`,
              priority: 'high',
              referenceId: finalTrip._id,
              referenceType: 'Trip',
              metadata: { tripId: finalTrip._id, tripNumber: finalTrip.tripNumber, status: newStatus }
            });

            if (ioInstance) {
              ioInstance.to(`driver:${targetDriverId}`).emit('trip:updated', {
                tripId: finalTrip._id,
                tripNumber: finalTrip.tripNumber,
                trip: finalTrip,
                message: 'Trip status updated.'
              });
            }
          }
        }
      }
    } catch (notifErr) {
      console.error('Failed to send trip update notification:', notifErr);
    }

    // Emit real-time status update to manager room
    const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
    if (io) {
      const managerId = finalTrip.assignedManager || (req.user && req.user._id);
      if (managerId) {
        io.to(`manager:${managerId}`).emit('trip:status-updated', finalTrip);
      }
    }

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
    await logActivity({
      title: 'Trip Cancelled',
      description: `Trip ${trip.tripNumber} cancelled.`,
      activityType: 'TRIP_CANCELLED',
      vehicleNumber: trip.vehiclePlate || '',
      vehicleName: trip.vehicleName || '',
      relatedModule: 'Trip',
      relatedId: trip._id,
      user: req.user,
      assignedManager: req.user._id
    });
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

    const filter = { vehicle: { $in: vehicleIds } };
    if (req.query.vehicle) {
      filter.vehicle = req.query.vehicle;
    }
    if (req.query.tripId) {
      filter.tripId = req.query.tripId;
    }
    const records = await getFuelRecords(filter);
    const formatted = records.map(r => {
      const obj = r.toObject ? r.toObject() : r;
      const img = obj.billUrl || obj.receiptImage || '';
      obj.billUrl = img;
      obj.receiptImage = img;
      return obj;
    });
    return sendSuccess(res, 200, formatted, 'Fuel records fetched');
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

    if (vehicle && (type?.toLowerCase().includes('insurance') || category?.toLowerCase().includes('insurance') || title?.toLowerCase().includes('insurance'))) {
      try {
        const query = [];
        if (mongoose.Types.ObjectId.isValid(vehicle)) {
          query.push({ _id: vehicle });
        }
        query.push({ vehicleNumber: vehicle }, { registrationNumber: vehicle });

        const targetVehicle = await Vehicle.findOne({ $or: query });
        if (targetVehicle) {
          let newExpDate = expiry ? new Date(expiry) : null;
          if (!newExpDate || isNaN(newExpDate.getTime())) {
            newExpDate = new Date();
            newExpDate.setFullYear(newExpDate.getFullYear() + 1);
          }
          targetVehicle.insuranceExpiry = newExpDate;
          if (!targetVehicle.documents) targetVehicle.documents = {};
          targetVehicle.documents.insurance = {
            fileUrl,
            fileName: title,
            originalName: title,
            uploadDate: new Date(),
            expiryDate: newExpDate,
            uploadedBy: req.user?.name || req.user?.email || 'Manager'
          };
          await targetVehicle.save();
        }
      } catch (vehSyncErr) {
        console.error('Failed to sync insurance document to vehicle:', vehSyncErr);
      }
    }

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
    console.log('\n===================================');
    console.log('Fetching Live Tracking Data...\n');

    const managerId = req.user._id;
    // Only vehicles belonging to the logged-in manager
    const vehicles = await Vehicle.find({ assignedManager: managerId }).populate('assignedDriver').sort({ createdAt: -1 });

    const trackingData = await Promise.all(vehicles.map(async (v) => {
      // Find the most recent trip for this vehicle
      const recentTrip = await Trip.findOne({ vehicle: v._id })
        .sort({ createdAt: -1 })
        .populate('driver');

      let activeTrip = null;
      let assignmentStatus = "Available";

      if (recentTrip && ['Scheduled', 'Assigned', 'In Progress', 'On Transit', 'Delayed', 'On Trip', 'Ready to Dispatch'].includes(recentTrip.status)) {
        activeTrip = recentTrip;
        if (['Scheduled', 'Assigned', 'Ready to Dispatch'].includes(recentTrip.status)) {
          assignmentStatus = "Assigned";
        } else {
          assignmentStatus = "On Trip";
        }
      } else {
        if (v.currentStatus === "Maintenance" || v.currentStatus === "Under Maintenance") {
          assignmentStatus = "Maintenance";
        } else if (v.currentStatus === "Inactive" || v.currentStatus === "Out of Service") {
          assignmentStatus = "Inactive";
        } else if (v.currentStatus === "Assigned") {
          assignmentStatus = "Assigned";
        } else if (v.currentStatus === "On Trip") {
          assignmentStatus = "On Trip";
        }
      }

      let currentLocation = v.currentLocation || v.branchDepot || v.branch || 'Guntakal';
      let currentLat = 15.1602;
      let currentLng = 77.3715;

      if (recentTrip) {
        if (recentTrip.status === 'Completed') {
          currentLocation = recentTrip.endLocation;
          assignmentStatus = "Available";
          const coords = await geocodeCity(recentTrip.endLocation);
          currentLat = coords[0];
          currentLng = coords[1];
        } else if (['In Progress', 'On Transit', 'On Trip', 'Delayed'].includes(recentTrip.status)) {
          currentLocation = `En route to ${recentTrip.endLocation}`;
          const startCoords = await geocodeCity(recentTrip.startLocation);
          const endCoords = await geocodeCity(recentTrip.endLocation);

          // Simulated coordinates along the active route (45% along line from Start to Destination)
          const progress = 0.45;
          currentLat = Number((startCoords[0] + (endCoords[0] - startCoords[0]) * progress).toFixed(4));
          currentLng = Number((startCoords[1] + (endCoords[1] - startCoords[1]) * progress).toFixed(4));

          console.log(`Trip:\n${recentTrip.startLocation} → ${recentTrip.endLocation}\n`);
          console.log(`Current Coordinates:\n${currentLat}\n${currentLng}\n`);
          console.log(`Vehicle Marker Updated\n`);
        } else if (['Scheduled', 'Assigned', 'Ready to Dispatch'].includes(recentTrip.status)) {
          currentLocation = recentTrip.startLocation;
          const coords = await geocodeCity(recentTrip.startLocation);
          currentLat = coords[0];
          currentLng = coords[1];

          console.log(`Trip:\n${recentTrip.startLocation} → ${recentTrip.endLocation}\n`);
          console.log(`Current Coordinates:\n${currentLat}\n${currentLng}\n`);
          console.log(`Vehicle Marker Updated\n`);
        }
      } else {
        const coords = await geocodeCity(currentLocation);
        currentLat = coords[0];
        currentLng = coords[1];
      }

      // Persist updated location & coordinates in DB if modified
      if (v.currentLocation !== currentLocation || v.currentLatitude !== currentLat || v.currentLongitude !== currentLng) {
        v.currentLocation = currentLocation;
        v.currentLatitude = currentLat;
        v.currentLongitude = currentLng;
        await v.save();
      }

      const driverName = v.assignedDriver?.fullName || (activeTrip ? (activeTrip.driver?.fullName || activeTrip.driverName) : "Unassigned");
      const driverPhone = v.assignedDriver?.phoneNumber || (activeTrip ? (activeTrip.driver?.phoneNumber || activeTrip.driverPhone) : "");

      return {
        _id: v._id,
        vehicleId: v._id,
        vehicleName: v.vehicleName,
        vehicleNumber: v.vehicleNumber,
        vehicleType: v.vehicleType,
        brand: v.brand,
        model: v.model,
        currentStatus: v.currentStatus,
        assignmentStatus,
        vehicleStatus: assignmentStatus,
        currentLocation,
        currentLatitude: currentLat,
        currentLongitude: currentLng,
        lastUpdated: v.updatedAt,
        updatedAt: v.updatedAt,
        fuelCapacity: v.fuelCapacity,
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
          tripId: activeTrip._id,
          tripNumber: activeTrip.tripNumber,
          startLocation: activeTrip.startLocation,
          destination: activeTrip.endLocation,
          endLocation: activeTrip.endLocation,
          status: activeTrip.status,
          eta: activeTrip.eta,
          routeDistance: activeTrip.estimatedDistance || 374,
          driverName: driverName,
          driverPhone: driverPhone,
          currentLatitude: currentLat,
          currentLongitude: currentLng
        } : null
      };
    }));

    console.log('===================================\n');

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

    console.log(`\n====================================`);
    console.log(`Fetching Recent Vehicle Activities...`);

    const limit = parseInt(req.query.limit) || 10;
    const activities = await ActivityLog.find({ assignedManager: managerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log(`\nLatest Activities Found: ${activities.length}`);
    console.log(`\nReturning Activity Logs...`);
    console.log(`====================================\n`);

    return sendSuccess(res, 200, activities, 'Recent vehicle activities fetched successfully');
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

      trip.tripInvoice = {
        invoiceId: newInvoice._id,
        invoiceNumber: newInvoice.invoiceNumber,
        url: newInvoice.pdfUrl || '',
        generatedAt: newInvoice.createdAt || newInvoice.invoiceDate
      };
      await trip.save();

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

export const getPODByTripId = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    let tripDoc = null;
    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      tripDoc = await Trip.findById(tripId).populate('driver');
    } else if (tripId) {
      const cleanId = String(tripId).replaceAll('#', '').trim();
      tripDoc = await Trip.findOne({
        $or: [
          { tripNumber: cleanId },
          { tripNumber: `#${cleanId}` },
          { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` }
        ]
      }).populate('driver');
    }

    if (tripDoc && tripDoc.proofOfDelivery && (tripDoc.proofOfDelivery.url || tripDoc.proofOfDelivery.podDocumentUrl || tripDoc.proofOfDelivery.deliveryPhotoUrl)) {
      const podData = {
        _id: tripDoc.proofOfDelivery._id || tripDoc._id,
        trip: tripDoc._id,
        podDocumentUrl: tripDoc.proofOfDelivery.url || tripDoc.proofOfDelivery.podDocumentUrl || tripDoc.proofOfDelivery.deliveryPhotoUrl,
        deliveryPhotoUrl: tripDoc.proofOfDelivery.deliveryPhotoUrl || tripDoc.proofOfDelivery.url,
        customerSignatureUrl: tripDoc.proofOfDelivery.customerSignatureUrl,
        customerName: tripDoc.proofOfDelivery.customerName || 'Customer Receiver',
        receiverName: tripDoc.proofOfDelivery.receiverName || 'Verified Receiver',
        status: tripDoc.proofOfDelivery.status || tripDoc.podStatus || 'Uploaded'
      };
      return sendSuccess(res, 200, podData, 'POD fetched successfully');
    }

    return sendSuccess(res, 200, null, 'No POD uploaded yet');
  } catch (error) {
    next(error);
  }
};

const checkAndCompleteTripIfApproved = async (tripId, req) => {
  if (!tripId) return;
  const trip = await Trip.findById(tripId);
  if (!trip || trip.status === 'Completed') return;

  const pod = await ProofOfDelivery.findOne({ trip: tripId });
  const weighbridge = await WeighbridgeSlip.findOne({ trip: tripId });

  const isPodApproved = (pod && (pod.status === 'Approved' || pod.status === 'APPROVED')) ||
                        (trip.proofOfDelivery && (trip.proofOfDelivery.status === 'Approved' || trip.podStatus === 'Approved'));
  const isWeighbridgeApproved = (weighbridge && (weighbridge.status === 'Approved' || weighbridge.status === 'APPROVED')) ||
                                (trip.weighbridgeSlip && (trip.weighbridgeSlip.status === 'Approved' || trip.weighbridgeStatus === 'Approved'));

  if (isPodApproved && isWeighbridgeApproved) {
    const endLoc = (trip.endLocation || trip.destination || '').trim();
    trip.status = 'Completed';
    trip.podStatus = 'Approved';
    trip.weighbridgeStatus = 'Approved';
    trip.actualEndTime = new Date();
    await trip.save();

    await updateDriverAndVehicleOnCompletion(trip.driver, trip.vehicle, endLoc);

    const io = req.io || req.app?.get('socketio') || req.app?.locals?.io;
    if (io) {
      io.to(`manager:${trip.assignedManager}`).emit('trip:status-updated', {
        tripId: trip._id,
        status: 'Completed',
        currentLocation: endLoc
      });
      if (trip.driver) {
        io.to(`driver:${trip.driver}`).emit('trip:completed', {
          tripId: trip._id,
          status: 'Completed',
          currentLocation: endLoc
        });
        io.to(`driver:${trip.driver}`).emit('trip:status-updated', {
          tripId: trip._id,
          status: 'Completed',
          currentLocation: endLoc
        });
        io.to(`driver:${trip.driver}`).emit('profile:updated', {
          driverId: trip.driver,
          currentLocation: endLoc,
          driverStatus: 'AVAILABLE'
        });
      }
    }

    if (trip.driver) {
      await createAndEmitNotification({
        io,
        recipient: trip.driver,
        recipientRole: 'DRIVER',
        type: 'trip_completed',
        title: `Trip Completed: #${trip.tripNumber}`,
        message: `Your trip #${trip.tripNumber} to ${endLoc} has been approved and completed! Current location updated to ${endLoc}.`,
        priority: 'high',
        metadata: { tripId: trip._id }
      });
    }
  }
};

export const updatePODStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    let pod = null;
    let targetTripId = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      pod = await ProofOfDelivery.findById(req.params.id);
    }

    if (!pod) {
      const cleanId = String(req.params.id).replaceAll('#', '').trim();
      let tripDoc = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        tripDoc = await Trip.findById(cleanId);
      }
      if (!tripDoc) {
        tripDoc = await Trip.findOne({
          $or: [
            { tripNumber: cleanId },
            { tripNumber: `#${cleanId}` },
            { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` }
          ]
        });
      }
      if (tripDoc) {
        targetTripId = tripDoc._id;
        pod = await ProofOfDelivery.findOne({ trip: targetTripId });
      }
    } else {
      targetTripId = pod.trip;
    }

    if (!pod && targetTripId) {
      const tripDoc = await Trip.findById(targetTripId);
      if (tripDoc && (tripDoc.proofOfDelivery?.url || tripDoc.podStatus !== 'Not Uploaded')) {
        pod = new ProofOfDelivery({
          podNumber: `POD-${Date.now()}`,
          trip: targetTripId,
          driver: tripDoc.driver,
          customerName: tripDoc.proofOfDelivery?.customerName || 'Customer Receiver',
          receiverName: tripDoc.proofOfDelivery?.receiverName || 'Verified Receiver',
          customerSignatureUrl: tripDoc.proofOfDelivery?.customerSignatureUrl || 'https://via.placeholder.com/300x100.png?text=Signature',
          deliveryPhotoUrl: tripDoc.proofOfDelivery?.deliveryPhotoUrl || 'https://via.placeholder.com/300x300.png?text=Delivery+Photo',
          podDocumentUrl: tripDoc.proofOfDelivery?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          status: status
        });
      }
    }

    if (!pod) {
      return sendError(res, 404, 'POD document not found');
    }

    pod.status = status;
    if (status === 'Rejected') {
      pod.rejectionReason = rejectionReason || 'No reason provided';
    } else {
      pod.rejectionReason = '';
    }
    await pod.save();

    const tripIdToUpdate = targetTripId || pod.trip;
    if (tripIdToUpdate) {
      const newPodStatus = status === 'Rejected' ? 'Rejected' : status;
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripIdToUpdate,
        {
          podStatus: newPodStatus,
          'proofOfDelivery.status': newPodStatus,
          ...(status === 'Rejected' ? { status: 'Documents Rejected' } : {})
        },
        { new: true }
      );

      const io = req.io || req.app?.get('socketio') || req.app?.locals?.io;
      if (status === 'Rejected' && updatedTrip?.driver) {
        await createAndEmitNotification({
          io,
          recipient: updatedTrip.driver,
          recipientRole: 'DRIVER',
          type: 'pod_rejected',
          title: 'Proof of Delivery Rejected',
          message: `Your POD document was rejected by manager. Reason: ${pod.rejectionReason}`,
          priority: 'high',
          metadata: { tripId: tripIdToUpdate, rejectionReason: pod.rejectionReason }
        });
        if (io) {
          io.to(`driver:${updatedTrip.driver}`).emit('pod:rejected', {
            tripId: tripIdToUpdate,
            rejectionReason: pod.rejectionReason,
            documentType: 'POD'
          });
          io.to(`driver:${updatedTrip.driver}`).emit('trip:status-updated', {
            tripId: tripIdToUpdate,
            status: 'Documents Rejected',
            rejectionReason: pod.rejectionReason
          });
        }
      } else if (status === 'Approved') {
        await checkAndCompleteTripIfApproved(tripIdToUpdate, req);
      }
    }

    return sendSuccess(res, 200, pod, `POD ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

export const getWeighbridgeByTripId = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    let tripDoc = null;
    if (tripId && mongoose.Types.ObjectId.isValid(tripId)) {
      tripDoc = await Trip.findById(tripId).populate('driver');
    } else if (tripId) {
      const cleanId = String(tripId).replaceAll('#', '').trim();
      tripDoc = await Trip.findOne({
        $or: [
          { tripNumber: cleanId },
          { tripNumber: `#${cleanId}` },
          { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` }
        ]
      }).populate('driver');
    }

    if (tripDoc && tripDoc.weighbridgeSlip && (tripDoc.weighbridgeSlip.url || tripDoc.weighbridgeSlip.documentUrl)) {
      const wbData = {
        _id: tripDoc.weighbridgeSlip._id || tripDoc._id,
        trip: tripDoc._id,
        documentUrl: tripDoc.weighbridgeSlip.url || tripDoc.weighbridgeSlip.documentUrl,
        grossWeight: tripDoc.weighbridgeSlip.grossWeight || 25000,
        tareWeight: tripDoc.weighbridgeSlip.tareWeight || 10000,
        netWeight: tripDoc.weighbridgeSlip.netWeight || 15000,
        location: tripDoc.weighbridgeSlip.location || 'Highway Weighbridge Station',
        status: tripDoc.weighbridgeSlip.status || tripDoc.weighbridgeStatus || 'Uploaded'
      };
      return sendSuccess(res, 200, wbData, 'Weighbridge slip fetched successfully');
    }

    return sendSuccess(res, 200, null, 'No Weighbridge slip uploaded yet');
  } catch (error) {
    next(error);
  }
};

export const getWeighbridgeSlipByTripId = getWeighbridgeByTripId;

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

export const getEarnings = async (req, res, next) => {
  try {
    const managerId = req.user._id;
    // Find all trips for this manager
    const trips = await Trip.find({ assignedManager: managerId }).populate('vehicle').populate('driver').sort({ createdAt: -1 });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalNetEarnings = 0;

    const tripEarnings = trips.map(trip => {
      const { revenue, expenses, netEarnings, distance, weight } = calculateTripFinance(trip);

      totalRevenue += revenue;
      totalExpenses += expenses;
      totalNetEarnings += netEarnings;

      return {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        vehicleName: trip.vehicleName || (trip.vehicle ? trip.vehicle.vehicleName : 'N/A'),
        vehiclePlate: trip.vehiclePlate || (trip.vehicle ? trip.vehicle.vehicleNumber : 'N/A'),
        driverName: trip.driverName || (trip.driver ? trip.driver.fullName : 'Unassigned'),
        startLocation: trip.startLocation,
        endLocation: trip.endLocation,
        status: trip.status,
        date: trip.createdAt,
        distance,
        cargoWeight: weight,
        revenue,
        expenses,
        netEarnings
      };
    });

    // Group earnings by month for chart data
    const monthlyStats = {};
    tripEarnings.forEach(te => {
      const date = new Date(te.date);
      const monthYear = date.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = { month: monthYear, revenue: 0, expenses: 0, netEarnings: 0 };
      }
      monthlyStats[monthYear].revenue += te.revenue;
      monthlyStats[monthYear].expenses += te.expenses;
      monthlyStats[monthYear].netEarnings += te.netEarnings;
    });

    const chartData = Object.values(monthlyStats).reverse();

    return sendSuccess(res, 200, {
      stats: {
        totalRevenue,
        totalExpenses,
        totalNetEarnings,
        tripCount: trips.length
      },
      chartData,
      tripEarnings
    }, 'Earnings data retrieved');
  } catch (error) {
    next(error);
  }
};

export const createVehicleComplaint = async (req, res, next) => {
  try {
    const { tripId, issueType, severity, description } = req.body;
    if (!tripId || !issueType || !severity || !description) {
      return sendError(res, 400, 'Trip, issue type, severity, and description are required');
    }

    const trip = await Trip.findById(tripId).populate('vehicle').populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    // Generate custom Ticket ID: TKT-VEH-YYYYMMDD-XXXX
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await VehicleComplaint.countDocuments({ ticketId: { $regex: new RegExp('^TKT-VEH-' + todayStr) } });
    const seq = String(count + 1).padStart(4, '0');
    const ticketId = `TKT-VEH-${todayStr}-${seq}`;

    const complaint = new VehicleComplaint({
      ticketId,
      trip: trip._id,
      vehicle: trip.vehicle?._id || trip.vehicle,
      vehiclePlate: trip.vehiclePlate,
      driver: trip.driver?._id || trip.driver,
      driverName: trip.driverName,
      issueType,
      severity,
      description,
      status: 'Open'
    });

    await complaint.save();

    // Create and emit notification for manager
    if (trip.assignedManager) {
      await createAndEmitNotification({
        io: req.io || (req.app && req.app.locals && req.app.locals.io),
        recipient: trip.assignedManager,
        recipientRole: 'FLEET_MANAGER',
        type: 'alert',
        title: `Vehicle Issue Ticket: ${ticketId}`,
        message: `Driver ${trip.driverName || 'assigned driver'} reported a ${severity} issue with vehicle ${trip.vehiclePlate} (${issueType}). Description: ${description}`,
        priority: severity === 'Critical' || severity === 'High' ? 'high' : 'normal',
        metadata: {
          ticketId,
          vehiclePlate: trip.vehiclePlate,
          driverName: trip.driverName,
          issueType,
          severity,
          tripId: trip._id
        },
        referenceId: ticketId,
        referenceType: 'VehicleComplaint'
      });
    }

    await logActivity({
      title: 'Vehicle Issue Reported',
      description: `Driver ${trip.driverName} reported a ${severity} issue (${issueType}) for vehicle ${trip.vehiclePlate} under trip ${trip.tripNumber}. Ticket ID: ${ticketId}.`,
      activityType: 'MAINTENANCE_LOGGED',
      user: req.user,
      assignedManager: req.user._id
    });

    return sendSuccess(res, 201, complaint, 'Vehicle complaint ticket submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const listVehicleComplaints = async (req, res, next) => {
  try {
    const { tripId } = req.query;
    let filter = {};

    if (tripId) {
      filter.trip = tripId;
    } else {
      const managerId = req.user._id;
      const trips = await Trip.find({ assignedManager: managerId }, '_id');
      const tripIds = trips.map(t => t._id);

      const drivers = await Driver.find({ assignedManager: managerId }, '_id');
      const driverIds = drivers.map(d => d._id);

      const vehicles = await Vehicle.find({ assignedManager: managerId }, '_id');
      const vehicleIds = vehicles.map(v => v._id);

      filter = {
        $or: [
          { trip: { $in: tripIds } },
          { driver: { $in: driverIds } },
          { vehicle: { $in: vehicleIds } }
        ]
      };
    }

    let complaints = await VehicleComplaint.find(filter)
      .populate('driver', 'fullName email phoneNumber')
      .populate('vehicle', 'registrationNumber make model plateNumber')
      .populate('trip', 'tripNumber origin destination')
      .sort({ createdAt: -1 });

    if (complaints.length === 0 && !tripId) {
      complaints = await VehicleComplaint.find({})
        .populate('driver', 'fullName email phoneNumber')
        .populate('vehicle', 'registrationNumber make model plateNumber')
        .populate('trip', 'tripNumber origin destination')
        .sort({ createdAt: -1 });
    }

    return sendSuccess(res, 200, complaints, 'Vehicle complaints retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateWeighbridgeSlipStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    let slip = null;
    let targetTripId = null;

    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      slip = await WeighbridgeSlip.findById(req.params.id);
    }

    if (!slip) {
      const cleanId = String(req.params.id).replaceAll('#', '').trim();
      let tripDoc = null;
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        tripDoc = await Trip.findById(cleanId);
      }
      if (!tripDoc) {
        tripDoc = await Trip.findOne({
          $or: [
            { tripNumber: cleanId },
            { tripNumber: `#${cleanId}` },
            { tripNumber: cleanId.startsWith('TRP-') ? cleanId : `TRP-${cleanId}` }
          ]
        });
      }
      if (tripDoc) {
        targetTripId = tripDoc._id;
        slip = await WeighbridgeSlip.findOne({ trip: targetTripId });
      }
    } else {
      targetTripId = slip.trip;
    }

    if (!slip && targetTripId) {
      const tripDoc = await Trip.findById(targetTripId);
      if (tripDoc && (tripDoc.weighbridgeSlip?.url || tripDoc.weighbridgeStatus !== 'Not Uploaded')) {
        slip = new WeighbridgeSlip({
          slipNumber: `WB-${Date.now()}`,
          trip: targetTripId,
          driver: tripDoc.driver,
          grossWeight: tripDoc.weighbridgeSlip?.grossWeight || 25000,
          tareWeight: tripDoc.weighbridgeSlip?.tareWeight || 10000,
          netWeight: tripDoc.weighbridgeSlip?.netWeight || 15000,
          location: tripDoc.weighbridgeSlip?.location || 'Highway Weighbridge Station',
          status: status,
          documentUrl: tripDoc.weighbridgeSlip?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
        });
      }
    }

    if (!slip) {
      return sendError(res, 404, 'Weighbridge Slip document not found');
    }

    slip.status = status;
    if (status === 'Rejected') {
      slip.rejectionReason = rejectionReason || 'No reason provided';
    } else {
      slip.rejectionReason = '';
    }
    await slip.save();

    const tripIdToUpdate = targetTripId || slip.trip;
    if (tripIdToUpdate) {
      const newSlipStatus = status === 'Rejected' ? 'Rejected' : status;
      const updatedTrip = await Trip.findByIdAndUpdate(
        tripIdToUpdate,
        {
          weighbridgeStatus: newSlipStatus,
          'weighbridgeSlip.status': newSlipStatus,
          ...(status === 'Rejected' ? { status: 'Documents Rejected' } : {})
        },
        { new: true }
      );

      const io = req.io || req.app?.get('socketio') || req.app?.locals?.io;
      if (status === 'Rejected' && updatedTrip?.driver) {
        await createAndEmitNotification({
          io,
          recipient: updatedTrip.driver,
          recipientRole: 'DRIVER',
          type: 'weighbridge_rejected',
          title: 'Weighbridge Slip Rejected',
          message: `Your Weighbridge slip was rejected by manager. Reason: ${slip.rejectionReason}`,
          priority: 'high',
          metadata: { tripId: tripIdToUpdate, rejectionReason: slip.rejectionReason }
        });
        if (io) {
          io.to(`driver:${updatedTrip.driver}`).emit('weighbridge:rejected', {
            tripId: tripIdToUpdate,
            rejectionReason: slip.rejectionReason,
            documentType: 'Weighbridge'
          });
          io.to(`driver:${updatedTrip.driver}`).emit('trip:status-updated', {
            tripId: tripIdToUpdate,
            status: 'Documents Rejected',
            rejectionReason: slip.rejectionReason
          });
        }
      } else if (status === 'Approved') {
        await checkAndCompleteTripIfApproved(tripIdToUpdate, req);
      }
    }

    return sendSuccess(res, 200, slip, `Weighbridge Slip ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

export const updateVehicleComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, estimatedCost, actualCost, notes, mechanicName, mechanicPhone, mechanicLocation } = req.body;

    const complaint = await VehicleComplaint.findById(id);
    if (!complaint) {
      return sendError(res, 404, 'Vehicle complaint not found');
    }

    // Handle Mechanic Assignment
    if (mechanicName || status === 'Mechanic Assigned') {
      complaint.assignedMechanic = {
        name: mechanicName || complaint.assignedMechanic?.name || 'Assigned Mechanic',
        phone: mechanicPhone || complaint.assignedMechanic?.phone || '',
        location: mechanicLocation || complaint.assignedMechanic?.location || '',
        assignedAt: new Date()
      };
      complaint.status = 'Mechanic Assigned';
      complaint.repairTimeline.push({
        status: 'Mechanic Assigned',
        updatedBy: `Manager (${req.user?.name || 'Fleet Manager'})`,
        updatedAt: new Date(),
        notes: `Assigned Mechanic: ${mechanicName || 'Offline Mechanic'} (${mechanicPhone || 'N/A'}, ${mechanicLocation || 'N/A'})`
      });

      // Send notification to Driver
      if (complaint.driver) {
        try {
          await createAndEmitNotification({
            io: req.io,
            recipient: complaint.driver,
            recipientRole: 'DRIVER',
            title: `Mechanic Assigned: ${complaint.ticketId}`,
            message: `Manager assigned Mechanic ${mechanicName || 'Offline Mechanic'} (${mechanicPhone || 'Contact Manager'}) at ${mechanicLocation || 'Nearest Service Spot'}.`,
            type: 'alert',
            priority: 'normal',
            metadata: {
              ticketId: complaint.ticketId,
              complaintId: complaint._id,
              status: 'Mechanic Assigned',
              mechanicName: mechanicName || 'Offline Mechanic',
              mechanicPhone: mechanicPhone || ''
            }
          });
        } catch (notifErr) {
          console.warn('Failed to send mechanic assigned notification to driver:', notifErr.message);
        }
      }
    } else if (status !== undefined) {
      complaint.status = status;
      complaint.repairTimeline.push({
        status,
        updatedBy: `Manager (${req.user?.name || 'Fleet Manager'})`,
        updatedAt: new Date(),
        notes: notes || `Manager updated status to ${status}`
      });

      if (status === 'Resolved' || status === 'Closed') {
        complaint.completionDate = new Date();

        // 1. Auto Vehicle Status Transition: Maintenance -> Active
        try {
          let vehicleIdToUpdate = complaint.vehicle;
          if (!vehicleIdToUpdate && complaint.vehiclePlate) {
            const vDoc = await Vehicle.findOne({
              $or: [
                { registrationNumber: complaint.vehiclePlate.trim() },
                { plateNumber: complaint.vehiclePlate.trim() },
                { vehicleNumber: complaint.vehiclePlate.trim() }
              ]
            });
            if (vDoc) vehicleIdToUpdate = vDoc._id;
          }

          if (vehicleIdToUpdate) {
            await Vehicle.findByIdAndUpdate(vehicleIdToUpdate, {
              status: 'Active',
              operationalStatus: 'Active'
            });
          }
        } catch (vehErr) {
          console.warn('Failed to auto-transition vehicle status to Active on ticket resolution:', vehErr.message);
        }

        // 2. Notify Driver: "Ticket Resolved - Continue Trip"
        if (complaint.driver) {
          try {
            await createAndEmitNotification({
              io: req.io,
              recipient: complaint.driver,
              recipientRole: 'DRIVER',
              title: `Ticket Resolved - Continue Trip 🚚`,
              message: `Vehicle complaint ${complaint.ticketId} is Resolved! Vehicle is now Active. You can continue your trip.`,
              type: 'trip',
              priority: 'high',
              metadata: {
                ticketId: complaint.ticketId,
                complaintId: complaint._id,
                status: 'Resolved',
                canContinueTrip: 'Yes'
              }
            });
          } catch (notifErr) {
            console.warn('Failed to send ticket resolved notification to driver:', notifErr.message);
          }
        }
      } else {
        complaint.completionDate = undefined;
      }
    }

    if (estimatedCost !== undefined) complaint.estimatedCost = Number(estimatedCost) || 0;
    if (actualCost !== undefined) complaint.actualCost = Number(actualCost) || 0;
    if (notes !== undefined) complaint.notes = notes;

    // Handle Category-Specific Dynamic Data
    const { categoryData } = req.body;
    if (categoryData && typeof categoryData === 'object') {
      complaint.categoryData = {
        ...complaint.categoryData?.toObject?.() || complaint.categoryData,
        ...categoryData
      };
    }

    await complaint.save();

    // Log manager activity
    await logActivity({
      title: 'Vehicle Complaint Updated',
      description: `Vehicle complaint ticket ${complaint.ticketId} updated to status ${complaint.status}.`,
      activityType: 'MAINTENANCE_LOGGED',
      user: req.user._id?.toString() || req.user.name || 'Fleet Manager',
      assignedManager: req.user._id
    });

    return sendSuccess(res, 200, complaint, 'Vehicle complaint updated successfully');
  } catch (error) {
    next(error);
  }
};

// ── Trip-Based Communication Controllers ──────────────────────────────────────────────

export const getTripChat = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    // Access check: Ensure user owns or is assigned to trip
    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: trip belongs to another manager');
    }

    const messages = await TripChat.find({ tripId }).sort({ timestamp: 1 });

    // Mark driver messages as read if manager requested
    if (req.query.markRead === 'true') {
      await TripChat.updateMany(
        { tripId, senderRole: 'Driver', isRead: false },
        { $set: { isRead: true, deliveryStatus: 'read' } }
      );
    }

    return sendSuccess(res, 200, { trip, messages }, 'Trip chat retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const sendTripMessage = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { message, messageType } = req.body;

    if (!message || !message.trim()) {
      return sendError(res, 400, 'Message text is required');
    }

    const trip = await Trip.findById(tripId).populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      return sendError(res, 400, `Cannot send messages for a ${trip.status} trip`);
    }

    const driverId = trip.driver?._id || trip.driver;
    const managerId = req.user._id;

    const chatMsg = await TripChat.create({
      tripId: trip._id,
      senderId: managerId,
      receiverId: driverId || managerId,
      senderRole: 'Manager',
      senderName: req.user.name || req.user.fullName || 'Fleet Manager',
      message: message.trim(),
      messageType: messageType || 'text',
      timestamp: new Date(),
      isRead: false,
      deliveryStatus: 'sent'
    });

    const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
    if (io) {
      // Emit to trip room
      io.to(`trip:${trip._id}`).emit('chat:new-message', chatMsg);

      // Emit notification to driver if driver ID exists
      if (driverId) {
        io.to(`driver:${driverId}`).emit('chat:new-message', chatMsg);
      }
    }

    // Trigger notification to driver if helper available
    if (driverId) {
      await createAndEmitNotification({
        userId: driverId,
        userRole: 'Driver',
        type: 'COMMUNICATION',
        title: `New message from Manager (${trip.tripNumber})`,
        message: `${req.user.name || 'Manager'}: ${message.trim().substring(0, 60)}`,
        relatedId: trip._id,
        relatedModel: 'Trip',
        io
      });
    }

    return sendSuccess(res, 201, chatMsg, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};

export const markTripMessagesRead = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    await TripChat.updateMany(
      { tripId, senderRole: 'Driver', isRead: false },
      { $set: { isRead: true, deliveryStatus: 'read' } }
    );

    const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
    if (io) {
      io.to(`trip:${tripId}`).emit('chat:messages-read', { tripId, readerRole: 'Manager' });
    }

    return sendSuccess(res, 200, { tripId }, 'Messages marked as read');
  } catch (error) {
    next(error);
  }
};

export const getTripCallHistory = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const calls = await CallHistory.find({ tripId }).sort({ startedAt: -1 });
    return sendSuccess(res, 200, calls, 'Call history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const saveCallLog = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { callerRole, receiverId, duration, status, startedAt, endedAt } = req.body;

    const trip = await Trip.findById(tripId).populate('driver');
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }

    const isManagerCaller = (callerRole || 'Manager') === 'Manager';
    const callerId = isManagerCaller ? req.user._id : (trip.driver?._id || trip.driver);
    const recId = receiverId || (isManagerCaller ? (trip.driver?._id || trip.driver) : req.user._id);

    const callLog = await CallHistory.create({
      tripId: trip._id,
      callerId,
      receiverId: recId,
      callerRole: callerRole || 'Manager',
      callerName: isManagerCaller ? (req.user.name || 'Manager') : (trip.driverName || 'Driver'),
      receiverName: isManagerCaller ? (trip.driverName || 'Driver') : (req.user.name || 'Manager'),
      startedAt: startedAt || new Date(),
      endedAt: endedAt || new Date(),
      duration: Number(duration) || 0,
      status: status || 'completed'
    });

    // Also insert system message in chat
    const sysMsg = await TripChat.create({
      tripId: trip._id,
      senderId: callerId,
      receiverId: recId,
      senderRole: 'System',
      senderName: 'System',
      message: `📞 ${callLog.callerName} initiated a call (${status}, duration: ${callLog.duration}s)`,
      messageType: 'call_log',
      timestamp: new Date(),
      isRead: true,
      deliveryStatus: 'read'
    });

    const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
    if (io) {
      io.to(`trip:${trip._id}`).emit('chat:new-message', sysMsg);
      io.to(`trip:${trip._id}`).emit('call:logged', callLog);
    }

    return sendSuccess(res, 201, { callLog, sysMsg }, 'Call log saved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUnreadChatCounts = async (req, res, next) => {
  try {
    const trips = await Trip.find({ assignedManager: req.user._id }).select('_id');
    const tripIds = trips.map(t => t._id);

    const unreadStats = await TripChat.aggregate([
      {
        $match: {
          tripId: { $in: tripIds },
          senderRole: 'Driver',
          isRead: false
        }
      },
      {
        $group: {
          _id: '$tripId',
          unreadCount: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {};
    unreadStats.forEach(item => {
      countsMap[item._id.toString()] = item.unreadCount;
    });

    return sendSuccess(res, 200, countsMap, 'Unread chat counts retrieved');
  } catch (error) {
    next(error);
  }
};

export const approveTripCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) return sendError(res, 404, 'Trip not found');

    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
    }

    trip.status = 'Completed';
    trip.actualEndTime = new Date();
    if (!trip.actualDistance || trip.actualDistance === 0) {
      trip.actualDistance = trip.estimatedDistance || 120;
    }
    trip.podStatus = 'Approved';
    trip.weighbridgeStatus = 'Approved';
    await trip.save();

    const destLoc = (trip.endLocation || trip.destination || '').trim();
    if (trip.driver) {
      await updateDriverAndVehicleOnCompletion(trip.driver, trip.vehicle, destLoc);
    }

    const io = req.app.get('socketio') || req.app.locals?.io;
    if (trip.driver) {
      await createAndEmitNotification({
        io,
        recipient: trip.driver,
        sender: req.user._id,
        recipientRole: 'DRIVER',
        senderRole: 'FLEET_MANAGER',
        type: 'trip_approved',
        title: 'Trip Approved',
        message: `Your trip #${trip.tripNumber} has been approved by the Fleet Manager and is now marked as Completed.`,
        priority: 'high',
        referenceId: trip._id,
        referenceType: 'Trip',
        metadata: { tripId: trip._id, tripNumber: trip.tripNumber }
      });

      if (io) {
        io.to(`driver:${trip.driver}`).emit('trip:updated', trip);
        io.to(`driver:${trip.driver}`).emit('trip:approved', trip);
      }
    }

    return sendSuccess(res, 200, trip, 'Trip completion approved successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectTripDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const trip = await Trip.findById(id);
    if (!trip) return sendError(res, 404, 'Trip not found');

    if (String(trip.assignedManager) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this trip belongs to another manager');
    }

    trip.status = 'In Progress';
    trip.podStatus = 'Rejected';
    trip.weighbridgeStatus = 'Rejected';
    trip.rejectionReason = reason || 'Uploaded documents require correction.';
    await trip.save();

    const io = req.app.get('socketio') || req.app.locals?.io;
    if (trip.driver) {
      await createAndEmitNotification({
        io,
        recipient: trip.driver,
        sender: req.user._id,
        recipientRole: 'DRIVER',
        senderRole: 'FLEET_MANAGER',
        type: 'documents_rejected',
        title: 'Documents Rejected',
        message: `Your uploaded documents for trip #${trip.tripNumber} require correction. Please review and upload again.`,
        priority: 'high',
        referenceId: trip._id,
        referenceType: 'Trip',
        metadata: { tripId: trip._id, tripNumber: trip.tripNumber, reason: trip.rejectionReason }
      });

      if (io) {
        io.to(`driver:${trip.driver}`).emit('trip:updated', trip);
        io.to(`driver:${trip.driver}`).emit('pod:rejected', trip);
      }
    }

    return sendSuccess(res, 200, trip, 'Trip documents rejected. Driver notified to re-upload.');
  } catch (error) {
    next(error);
  }
};

