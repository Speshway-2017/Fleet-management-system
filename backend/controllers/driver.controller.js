import {
  getDrivers,
  getDriverById,
  createDriverRecord,
  updateDriverRecord,
  deleteDriverRecord,
} from '../repositories/driver.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import fs from 'fs';

/**
 * List all drivers
 * GET /api/drivers
 */
export const listDrivers = async (_req, res, next) => {
  try {
    const drivers = await getDrivers();
    return sendSuccess(res, 200, drivers, 'Drivers fetched successfully');
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
    });

    return sendSuccess(res, 201, driver, 'Driver created successfully');
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message =
        field === 'licenseNumber'
          ? 'A driver with this license number already exists'
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
