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
        status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
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
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
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
