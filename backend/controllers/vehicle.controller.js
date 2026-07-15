import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
} from '../repositories/vehicle.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { processVehicleDocuments } from '../utils/documentHelper.js';
import fs from 'fs';
import Trip from '../models/Trip.js';
import Vehicle from '../models/Vehicle.js';

/**
 * List all vehicles
 * GET /api/vehicles
 */
export const listVehicles = async (_req, res, next) => {
  try {
    const vehicles = await getVehicles();
    return sendSuccess(res, 200, vehicles, 'Vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * List all available (unallocated) vehicles
 * GET /api/vehicles/available
 */
export const getAvailableVehicles = async (req, res, next) => {
  try {
    const activeTrips = await Trip.find({
      status: { $in: ['Scheduled', 'On Transit', 'Delayed', 'Assigned', 'In Progress', 'On Trip'] }
    });

    const allocatedVehicleIds = activeTrips.map(t => t.vehicle).filter(Boolean);

    const filter = {
      _id: { $nin: allocatedVehicleIds },
      currentStatus: { $in: ['Available', 'Active'] }
    };

    if (req.query.location) {
      const cleanLoc = req.query.location.trim().split(/[\s,]+/)[0];
      filter.branch = { $regex: new RegExp(cleanLoc, 'i') };
    }

    const availableVehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, availableVehicles, 'Available vehicles fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single vehicle by ID
 * GET /api/vehicles/:id
 */
export const getVehicle = async (req, res, next) => {
  try {
    const vehicle = await getVehicleById(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, vehicle, 'Vehicle fetched successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new vehicle
 * POST /api/vehicles
 */
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
      assignedDriver,
      currentStatus,
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

    if (!vehicleNumber) {
      return sendError(res, 400, 'Vehicle number is required');
    }

    const processedDocs = await processVehicleDocuments(documents, req.user);

    const resolvedBrand = brand || manufacturer;
    const resolvedTransmission = transmissionType || transmission || 'Manual';
    const resolvedOwnership = ownershipType || ownership || 'Owned';
    const resolvedBranch = branch || branchDepot || 'Pune';
    const resolvedLastService = lastService || lastServiceDate || undefined;
    const resolvedNextService = nextService || nextServiceDue || undefined;

    const vehicle = await createVehicleInRepo({
      vehicleName: vehicleName || (resolvedBrand ? `${resolvedBrand} ${model}` : model),
      vehicleNumber,
      registrationNumber: registrationNumber || vehicleNumber,
      vehicleType: vehicleType || 'Truck',
      brand: resolvedBrand,
      manufacturer: resolvedBrand,
      model,
      manufactureYear: manufactureYear ? Number(manufactureYear) : undefined,
      assignedDriver: assignedDriver || undefined,
      currentStatus: currentStatus || 'Available',
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

    return sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

/**
 * Update a vehicle
 * PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const updateData = { ...req.body };

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

    // Fetch the current vehicle state before updating
    const existingVehicle = await getVehicleById(vehicleId);
    if (!existingVehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }

    // Set assignedDriver to null or keep it as passed, without trying to sync to Driver model
    if (updateData.assignedDriver === 'Unassigned' || updateData.assignedDriver === '') {
      updateData.assignedDriver = null;
    }

    const vehicle = await updateVehicleInRepo(vehicleId, updateData);
    return sendSuccess(res, 200, vehicle, 'Vehicle updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

/**
 * Delete a vehicle
 * DELETE /api/vehicles/:id
 */
export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await deleteVehicleInRepo(req.params.id);
    if (!vehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }
    return sendSuccess(res, 200, {}, 'Vehicle deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload vehicle document
 * POST /api/vehicles/upload-document
 * Expects multipart form-data with "document" field
 */
export const uploadVehicleDocument = async (req, res, next) => {
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
