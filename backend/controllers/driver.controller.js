import { resolveLocationName, isCoordinateString } from '../utils/reverseGeocoder.js';
import { geocodeCity, getDistanceKm, getRoadDistanceAndEta, isSameLocation } from '../utils/geocodingHelper.js';
import {
  getDrivers,
  getDriverById,
  createDriverRecord,
  updateDriverRecord,
  deleteDriverRecord,
} from '../repositories/driver.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import fs from 'fs';
import path from 'path';
import cloudinary from '../utils/cloudinary.js';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import Document from '../models/Document.js';
import mongoose from 'mongoose';
import { generateEmployeeId, generateTempPassword } from '../utils/driverAuthHelper.js';
import { hashPassword } from '../utils/hashPassword.js';
import { syncDriverLocationFromLatestTrip } from '../utils/driverLocationHelper.js';

/**
 * Fetch Driver Statistics
 * GET /api/drivers/stats, GET /api/drivers/dashboard
 */
export const getDriverStats = async (req, res, next) => {
  try {
    const baseFilter = { isDeleted: { $ne: true } };
    if (req.user && req.user._id) {
      baseFilter.assignedManager = req.user._id;
    }

    const totalDrivers = await Driver.countDocuments(baseFilter);
    const activeDrivers = await Driver.countDocuments({
      ...baseFilter,
      driverStatus: { $in: ['AVAILABLE', 'ON_TRIP', 'ASSIGNED'] }
    });
    const availableDrivers = await Driver.countDocuments({
      ...baseFilter,
      driverStatus: 'AVAILABLE'
    });
    const onTripDrivers = await Driver.countDocuments({
      ...baseFilter,
      driverStatus: 'ON_TRIP'
    });
    const suspendedDrivers = await Driver.countDocuments({
      ...baseFilter,
      driverStatus: 'SUSPENDED'
    });

    console.log('\nFetching Driver Statistics...');
    console.log(`Total Drivers in MongoDB:\n${totalDrivers}\n`);
    console.log(`Active Drivers:\n${activeDrivers}\n`);
    console.log(`On Trip:\n${onTripDrivers}\n`);
    console.log(`Suspended:\n${suspendedDrivers}\n`);
    console.log('Returning dashboard statistics...\n');

    return res.status(200).json({
      success: true,
      message: 'Driver statistics fetched successfully',
      data: {
        totalDrivers,
        activeDrivers,
        availableDrivers,
        onTripDrivers,
        suspendedDrivers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List drivers belonging to the logged-in manager
 * GET /api/drivers
 */
export const listDrivers = async (req, res, next) => {
  try {
    // Always scope to the logged-in manager and exclude soft-deleted drivers only
    const filter = { assignedManager: req.user._id, isDeleted: { $ne: true } };

    // 1. Search by Name, Employee ID, Phone, Email, or DL number
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { phoneNumber: searchRegex },
        { email: searchRegex },
        { licenseNumber: searchRegex }
      ];
    }

    // 2. Filter by Driver Status
    if (req.query.driverStatus) {
      filter.driverStatus = req.query.driverStatus;
    }

    // 3. Filter by Assigned Vehicle
    if (req.query.assignedVehicle) {
      if (req.query.assignedVehicle === 'Unassigned') {
        filter.assignedVehicle = 'Unassigned';
      } else {
        filter.assignedVehicle = new RegExp(req.query.assignedVehicle, 'i');
      }
    }

    // 4. Filter by License Status
    if (req.query.licenseStatus) {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);

      if (req.query.licenseStatus === 'Expired') {
        filter.licenseExpiry = { $lt: today };
      } else if (req.query.licenseStatus === 'Expiring Soon') {
        filter.licenseExpiry = { $gte: today, $lte: thirtyDaysLater };
      } else if (req.query.licenseStatus === 'Valid') {
        filter.licenseExpiry = { $gt: thirtyDaysLater };
      }
    }

    // 5. Filter by Location (currentLocation, driverLocation, or branch)
    const rawLoc = req.query.location || req.query.startLocation;
    if (rawLoc && typeof rawLoc === 'string' && rawLoc.trim()) {
      const cleanLoc = rawLoc.trim();
      const firstWord = cleanLoc.split(/[\s,]+/)[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const escapedLoc = cleanLoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const locRegex = new RegExp(`^\\s*${escapedLoc}\\s*$|${firstWord}`, 'i');

      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { currentLocation: locRegex },
          { driverLocation: locRegex },
          { branch: locRegex }
        ]
      });
    }

    // 6. Exclude drivers on active trips if availableOnly is set
    if (req.query.availableOnly === 'true' || req.query.available === 'true') {
      const activeTrips = await Trip.find({
        status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
      });
      const allocatedDriverIds = activeTrips.map(t => t.driver).filter(Boolean);
      filter._id = { $nin: allocatedDriverIds };
      filter.driverStatus = 'AVAILABLE';
    }

    // 7. Pagination & Sorting
    const page = parseInt(req.query.page) || 1;
    let limit = 1000;
    if (req.query.limit) {
      limit = req.query.limit === 'all' ? 10000 : parseInt(req.query.limit);
    }
    const skip = (page - 1) * limit;

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const total = await Driver.countDocuments(filter);
    const drivers = await Driver.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    for (const d of drivers) {
      await syncDriverLocationFromLatestTrip(d);
      const rawLoc = d.currentLocation || d.driverLocation;
      if (isCoordinateString(rawLoc)) {
        const resolvedName = await resolveLocationName(rawLoc, d.branch);
        d.currentLocation = resolvedName;
        d.driverLocation = resolvedName;
        Driver.findByIdAndUpdate(d._id, { currentLocation: resolvedName, driverLocation: resolvedName }).catch(() => { });
      }
    }

    // Compute overall statistics using countDocuments()
    const baseStatsFilter = { assignedManager: req.user._id, isDeleted: { $ne: true } };
    const totalDriversInDB = await Driver.countDocuments(baseStatsFilter);
    const activeDriversCount = await Driver.countDocuments({
      ...baseStatsFilter,
      driverStatus: { $in: ['AVAILABLE', 'ON_TRIP', 'ASSIGNED'] }
    });
    const availableDriversCount = await Driver.countDocuments({
      ...baseStatsFilter,
      driverStatus: 'AVAILABLE'
    });
    const onTripDriversCount = await Driver.countDocuments({
      ...baseStatsFilter,
      driverStatus: 'ON_TRIP'
    });
    const suspendedDriversCount = await Driver.countDocuments({
      ...baseStatsFilter,
      driverStatus: 'SUSPENDED'
    });

    console.log('\nFetching Driver Statistics...');
    console.log(`Total Drivers in MongoDB:\n${totalDriversInDB}\n`);
    console.log(`Active Drivers:\n${activeDriversCount}\n`);
    console.log(`On Trip:\n${onTripDriversCount}\n`);
    console.log(`Suspended:\n${suspendedDriversCount}\n`);
    console.log('Returning dashboard statistics...\n');

    return res.status(200).json({
      success: true,
      message: 'Drivers fetched successfully',
      data: drivers,
      stats: {
        totalDrivers: totalDriversInDB,
        activeDrivers: activeDriversCount,
        availableDrivers: availableDriversCount,
        onTripDrivers: onTripDriversCount,
        suspendedDrivers: suspendedDriversCount
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all available (unallocated) drivers
 * GET /api/drivers/available
 */
export const getAvailableDrivers = async (req, res, next) => {
  try {
    const activeTrips = await Trip.find({
      status: { $nin: ['Completed', 'Cancelled', 'Rejected'] }
    });

    const allocatedDriverIds = activeTrips.map(t => t.driver).filter(Boolean);

    const allAvailable = await Driver.find({
      assignedManager: req.user._id,
      _id: { $nin: allocatedDriverIds },
      driverStatus: 'AVAILABLE',
      $or: [
        { licenseExpiry: { $exists: false } },
        { licenseExpiry: null },
        { licenseExpiry: { $gte: new Date() } }
      ]
    });

    for (const d of allAvailable) {
      await syncDriverLocationFromLatestTrip(d);
      const rawLoc = d.currentLocation || d.driverLocation;
      if (isCoordinateString(rawLoc)) {
        const resolvedName = await resolveLocationName(rawLoc, d.branch);
        d.currentLocation = resolvedName;
        d.driverLocation = resolvedName;
        Driver.findByIdAndUpdate(d._id, { currentLocation: resolvedName, driverLocation: resolvedName }).catch(() => { });
      }

      // Populate assignedVehicle from assignmentHistory, Vehicle model, or recent completed trip if empty
      let vehStr = (d.assignedVehicle && d.assignedVehicle !== 'Unassigned') ? d.assignedVehicle : '';
      if (!vehStr && d.assignmentHistory && d.assignmentHistory.length > 0) {
        const lastAssignment = d.assignmentHistory[d.assignmentHistory.length - 1];
        if (lastAssignment && lastAssignment.vehicleNumber) {
          vehStr = lastAssignment.vehicleNumber;
        }
      }
      if (!vehStr) {
        try {
          const VehicleModel = (await import('../models/Vehicle.js')).default;
          const vDoc = await VehicleModel.findOne({ assignedDriver: d._id });
          if (vDoc) {
            vehStr = vDoc.registrationNumber || vDoc.vehicleNumber || '';
          }
        } catch (e) { }
      }
      if (!vehStr) {
        try {
          const TripModel = (await import('../models/Trip.js')).default;
          const lastTrip = await TripModel.findOne({ driver: d._id }).sort({ createdAt: -1 });
          if (lastTrip && (lastTrip.vehiclePlate || lastTrip.vehicleName)) {
            vehStr = lastTrip.vehiclePlate || lastTrip.vehicleName;
          }
        } catch (e) { }
      }
      if (vehStr) {
        d.assignedVehicle = vehStr;
      }
    }

    const targetLoc = (req.query.location || req.query.startLocation || '').trim();
    if (!targetLoc) {
      return sendSuccess(res, 200, allAvailable, 'Available drivers fetched successfully');
    }

    const getDriverEffectiveLocation = (d) => {
      if (d.currentLocation && d.currentLocation.trim()) return d.currentLocation.trim();
      if (d.driverLocation && d.driverLocation.trim()) return d.driverLocation.trim();
      if (d.branch && d.branch.trim()) return d.branch.trim();
      return '';
    };

    const localDrivers = [];
    const nearbyRawDrivers = [];

    for (const d of allAvailable) {
      const rawEffective = getDriverEffectiveLocation(d);
      const dLoc = await resolveLocationName(rawEffective || 'Visakhapatnam', d.branch);
      const dObj = d.toObject ? d.toObject() : { ...d };
      if (isSameLocation(targetLoc, dLoc)) {
        localDrivers.push({
          ...dObj,
          isNearby: false,
          isAtPickupLocation: true,
          distanceKm: 0,
          estimatedTravelTime: '0 mins',
          currentBranch: d.branch || d.currentLocation || dLoc,
          currentLocation: dLoc
        });
      } else {
        nearbyRawDrivers.push({ driver: d, dLoc });
      }
    }

    console.log(`\nAvailable Drivers for "${targetLoc}": ${localDrivers.length} local matching drivers found.`);
    const mappedNearbyDrivers = await Promise.all(
      nearbyRawDrivers.map(async ({ driver: d, dLoc }) => {
        const routeData = await getRoadDistanceAndEta(targetLoc, dLoc);
        const dObj = d.toObject ? d.toObject() : { ...d };
        const dist = routeData.unresolvable ? 9999 : (routeData.distanceKm ?? 9999);
        return {
          ...dObj,
          isNearby: dist <= 50,
          isAtPickupLocation: false,
          distanceKm: dist,
          estimatedTravelTime: routeData.estimatedTravelTime,
          currentBranch: d.branch || d.currentLocation || dLoc,
          currentLocation: dLoc
        };
      })
    );

    const allSortedDrivers = [...localDrivers, ...mappedNearbyDrivers].sort((a, b) => a.distanceKm - b.distanceKm);
    const driversWithin50 = allSortedDrivers.filter(d => d.distanceKm <= 50);

    const hasNearby = driversWithin50.length > 0;
    let isNearbyFallback = false;
    let isExtendedFallback = false;

    let finalDriversToReturn = [];
    if (hasNearby) {
      finalDriversToReturn = driversWithin50;
      isNearbyFallback = localDrivers.length === 0;
    } else {
      finalDriversToReturn = allSortedDrivers;
      isExtendedFallback = true;
      isNearbyFallback = true;
    }

    return sendSuccess(res, 200, {
      drivers: finalDriversToReturn,
      localDrivers,
      nearbyDrivers: driversWithin50,
      allDriversSorted: allSortedDrivers,
      localCount: localDrivers.length,
      nearbyCount: driversWithin50.length,
      hasNearby,
      isNearbyFallback,
      isExtendedFallback
    }, 'Available drivers fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single driver by ID — only if they belong to the logged-in manager
 * GET /api/drivers/:id
 */
export const getDriver = async (req, res, next) => {
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
    return sendSuccess(res, 200, driver, 'Driver fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new driver
 * POST /api/drivers
 */
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

    const temporaryPassword = req.body.password || generateTempPassword();
    const hashedPassword = await hashPassword(temporaryPassword);
    const generatedEmpId = req.body.employeeId || await generateEmployeeId();

    const driver = await createDriverRecord({
      fullName: computedFullName,
      email: finalEmail,
      phoneNumber: finalPhone,
      licenseNumber: finalLicense,
      password: hashedPassword,
      licenseType: licenseType || 'HMV',
      licenseExpiry: licenseExpiry ? new Date(licenseExpiry) : undefined,
      assignedVehicle: assignedVehicle || 'Unassigned',
      driverStatus: driverStatus || 'AVAILABLE',
      accountStatus: 'Active',
      status: status || 'Active',
      employeeId: generatedEmpId,
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

    console.log(`\n==================================================`);
    console.log(`🔑 NEW DRIVER CREATED`);
    console.log(`👤 Name:     ${driver.fullName}`);
    console.log(`📧 Email:    ${driver.email}`);
    console.log(`🔑 Password: ${rawPassword}`);
    console.log(`📱 Phone:    ${driver.phoneNumber}`);
    console.log(`🆔 Emp ID:   ${driver.employeeId || driver._id}`);
    console.log(`==================================================\n`);

    return sendSuccess(res, 201, driver, 'Driver created successfully');
  } catch (error) {
    console.error(`Driver Creation Failed:`, error);
    if (error.code === 11000) {
      return sendError(res, 400, 'A driver with this email, mobile number, or license number already exists');
    }
    next(error);
  }
};

/**
 * Update a driver — only if they belong to the logged-in manager
 * PUT /api/drivers/:id
 */
export const updateDriver = async (req, res, next) => {
  try {
    // Ownership check before update
    const existing = await getDriverById(req.params.id);
    if (!existing) {
      return sendError(res, 404, 'Driver not found');
    }
    const managerId = existing.assignedManager?._id || existing.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
    }
    const driver = await updateDriverRecord(req.params.id, req.body);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }

    // Emit real-time driver status update to manager room
    const io = req.app.get('socketio') || (req.app.locals ? req.app.locals.io : null);
    if (io) {
      const managerId = driver.assignedManager || (req.user && req.user._id);
      if (managerId) {
        io.to(`manager:${managerId}`).emit('driver:status-updated', driver);
      }
    }

    return sendSuccess(res, 200, driver, 'Driver updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message =
        field === 'licenseNumber'
          ? 'A driver with this license number already exists'
          : field === 'employeeId'
            ? 'A driver with this Employee ID already exists'
            : 'A driver with this email already exists';
      return sendError(res, 409, message);
    }
    next(error);
  }
};

/**
 * Delete a driver — only if they belong to the logged-in manager
 * DELETE /api/drivers/:id
 */
export const deleteDriver = async (req, res, next) => {
  try {
    // Ownership check before delete
    const existing = await getDriverById(req.params.id);
    if (!existing) {
      return sendError(res, 404, 'Driver not found');
    }
    const managerId = existing.assignedManager?._id || existing.assignedManager;
    if (String(managerId) !== String(req.user._id)) {
      return sendError(res, 403, 'Access denied: this driver belongs to another manager');
    }
    await deleteDriverRecord(req.params.id);
    return sendSuccess(res, 200, {}, 'Driver deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload driver document (license scan)
 * POST /api/drivers/upload-document
 * Expects multipart form-data with "document" field
 */
export const uploadDriverDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      console.log("Upload failed: No file uploaded");
      return sendError(res, 400, 'No file uploaded');
    }

    // 1. Log file info
    console.log("------ File Upload Received ------");
    console.log("req.file details:", req.file);
    console.log("File size:", req.file.size);
    console.log("File mimetype:", req.file.mimetype);

    // 2. Perform Cloudinary Stream Upload
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'fleet_documents',
          resource_type: 'auto'
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadResult);
          }
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // 3. Log Cloudinary response
    console.log("Cloudinary Upload Response:", result);

    // 4. Save metadata into MongoDB (Document collection)
    const fileExt = path.extname(req.file.originalname).replace('.', '').toUpperCase() || 'PDF';
    const sizeInMb = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const doc = new Document({
      title: req.file.originalname,
      fileUrl: result.secure_url,
      type: fileExt,
      category: 'Driver Doc',
      fileSize: sizeInMb,
      fileType: fileExt,
      uploadedBy: req.user ? req.user._id : null,
      public_id: result.public_id,
      secure_url: result.secure_url,
      originalName: req.file.originalname
    });

    await doc.save();
    console.log("MongoDB Document saved successfully:", doc);

    // 5. Return the Cloudinary URL in the API response
    return sendSuccess(
      res,
      201,
      {
        url: result.secure_url,
        originalName: req.file.originalname,
        size: req.file.size,
        filename: req.file.originalname,
        public_id: result.public_id,
        secure_url: result.secure_url,
        docId: doc._id
      },
      'Document uploaded successfully'
    );
  } catch (error) {
    // 6. Log Cloudinary / general errors
    console.error("------ Cloudinary Upload Failure ------");
    console.error("Complete error object:", error);
    return sendError(res, 500, `Cloudinary upload failed: ${error.message || error}`);
  }
};
