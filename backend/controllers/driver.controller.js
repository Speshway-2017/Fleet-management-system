import {
  getDrivers,
  getDriverById,
  createDriverRecord,
  updateDriverRecord,
  deleteDriverRecord,
} from '../repositories/driver.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import fs from 'fs';
import Trip from '../models/Trip.js';
import Driver from '../models/Driver.js';
import mongoose from 'mongoose';

/**
 * List all drivers with filtering, search, sorting, and pagination
 * GET /api/drivers
 */
export const listDrivers = async (req, res, next) => {
  try {
    const filter = {};

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

    // 5. Pagination & Sorting
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
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });

    const allocatedDriverIds = activeTrips.map(t => t.driver).filter(Boolean);

    const filter = {
      _id: { $nin: allocatedDriverIds },
      driverStatus: 'AVAILABLE',
      $or: [
        { licenseExpiry: { $exists: false } },
        { licenseExpiry: null },
        { licenseExpiry: { $gte: new Date() } }
      ]
    };

    if (req.query.location) {
      const cleanLoc = req.query.location.trim().split(/[\s,]+/)[0];
      filter.branch = { $regex: new RegExp(cleanLoc, 'i') };
    }

    const availableDrivers = await Driver.find(filter).sort({ createdAt: -1 });

    return sendSuccess(res, 200, availableDrivers, 'Available drivers fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single driver by ID
 * GET /api/drivers/:id
 */
export const getDriver = async (req, res, next) => {
  try {
    const driver = await getDriverById(req.params.id);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
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
      licenseIssuingAuthority,
      onTimeDeliveries,
      attendancePercentage,
      safetyRecord,
      trafficViolations,
    } = req.body;

    if (!fullName || !email || !phoneNumber || !licenseNumber) {
      return sendError(res, 400, 'Full name, email, phone number, and license number are required');
    }

    const driver = await createDriverRecord({
      fullName,
      email,
      phoneNumber,
      licenseNumber,
      licenseType: licenseType || 'HMV',
      licenseExpiry: licenseExpiry || undefined,
      assignedVehicle: assignedVehicle || 'Unassigned',
      driverStatus: driverStatus || 'AVAILABLE',
      experience: experience || '',
      joiningDate: joiningDate || undefined,
      medicalFitnessStatus: medicalFitnessStatus || 'Fit',
      profileImage: profileImage || '',
      licenseDocument: licenseDocument || '',
      assignedManager: req.user?._id,
      employeeId: employeeId || undefined,
      dob: dob || undefined,
      gender: gender || 'Male',
      address: address || '',
      licenseIssuingAuthority: licenseIssuingAuthority || '',
      onTimeDeliveries: onTimeDeliveries !== undefined ? Number(onTimeDeliveries) : 0,
      attendancePercentage: attendancePercentage !== undefined ? Number(attendancePercentage) : 100,
      safetyRecord: safetyRecord || 'Excellent',
      trafficViolations: trafficViolations !== undefined ? Number(trafficViolations) : 0,
    });

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
 * Update a driver
 * PUT /api/drivers/:id
 */
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await updateDriverRecord(req.params.id, req.body);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
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
 * Delete a driver
 * DELETE /api/drivers/:id
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await deleteDriverRecord(req.params.id);
    if (!driver) {
      return sendError(res, 404, 'Driver not found');
    }
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
      return sendError(res, 400, 'No file uploaded');
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return sendSuccess(
      res,
      201,
      {
        url: fileUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        filename: req.file.filename,
      },
      'Document uploaded successfully'
    );
  } catch (error) {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    next(error);
  }
};
