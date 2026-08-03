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

/**
 * List drivers belonging to the logged-in manager
 * GET /api/drivers
 */
export const listDrivers = async (req, res, next) => {
  try {
    // Always scope to the logged-in manager
    const filter = { assignedManager: req.user._id };

    // 1. Search by Name, Employee ID, or Phone
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { employeeId: searchRegex },
        { phoneNumber: searchRegex }
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
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const total = await Driver.countDocuments(filter);
    const drivers = await Driver.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Drivers fetched successfully',
      data: drivers,
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

    const filter = {
      assignedManager: req.user._id,
      _id: { $nin: allocatedDriverIds },
      driverStatus: 'AVAILABLE',
      $or: [
        { licenseExpiry: { $exists: false } },
        { licenseExpiry: null },
        { licenseExpiry: { $gte: new Date() } }
      ]
    };

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

    const availableDrivers = await Driver.find(filter);

    if (rawLoc && typeof rawLoc === 'string' && rawLoc.trim()) {
      const cleanLoc = rawLoc.trim().toLowerCase();
      const firstWord = cleanLoc.split(/[\s,]+/)[0];
      availableDrivers.sort((a, b) => {
        const aLoc = (a.currentLocation || a.driverLocation || a.branch || '').toLowerCase();
        const bLoc = (b.currentLocation || b.driverLocation || b.branch || '').toLowerCase();
        const aMatch = aLoc.includes(firstWord) || firstWord.includes(aLoc);
        const bMatch = bLoc.includes(firstWord) || firstWord.includes(bLoc);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    } else {
      availableDrivers.sort((a, b) => b.createdAt - a.createdAt);
    }

    return sendSuccess(res, 200, availableDrivers, 'Available drivers fetched successfully');
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
  try {
    const {
      fullName,
      email,
      phoneNumber,
      licenseNumber,
      licenseType,
      licenseExpiry,
      assignedVehicle,
      driverStatus,
      experience,
      joiningDate,
      medicalFitnessStatus,
      profileImage,
      licenseDocument,
      employeeId,
      dob,
      gender,
      address,
      driverLocation,
      licenseIssuingAuthority,
      onTimeDeliveries,
      attendancePercentage,
      safetyRecord,
      trafficViolations,
    } = req.body;

    if (!fullName || !email || !phoneNumber || !licenseNumber) {
      return sendError(res, 400, 'Full name, email, phone number, and license number are required');
    }

    const rawPassword = req.body.password || 'driver123';

    const driver = await createDriverRecord({
      fullName,
      email,
      phoneNumber,
      licenseNumber,
      password: rawPassword,
      licenseType: licenseType || 'HMV',
      licenseExpiry: licenseExpiry || undefined,
      assignedVehicle: assignedVehicle || 'Unassigned',
      driverStatus: driverStatus || 'AVAILABLE',
      experience: experience || '',
      joiningDate: joiningDate || undefined,
      medicalFitnessStatus: medicalFitnessStatus || '✅ Fit',
      profileImage: profileImage || '',
      licenseDocument: licenseDocument || '',
      assignedManager: req.user?._id,
      employeeId: employeeId || undefined,
      dob: dob || undefined,
      gender: gender || 'Male',
      address: address || '',
      driverLocation: driverLocation || '',
      licenseIssuingAuthority: licenseIssuingAuthority || '',
      onTimeDeliveries: onTimeDeliveries !== undefined ? Number(onTimeDeliveries) : 0,
      attendancePercentage: attendancePercentage !== undefined ? Number(attendancePercentage) : 100,
      safetyRecord: safetyRecord || 'Excellent',
      trafficViolations: trafficViolations !== undefined ? Number(trafficViolations) : 0,
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
