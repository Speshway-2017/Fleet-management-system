import {
  getVehicles,
  getVehicleById,
  createVehicle as createVehicleInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
} from '../repositories/vehicle.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

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
    } = req.body;

    if (!vehicleNumber) {
      return sendError(res, 400, 'Vehicle number is required');
    }

    const vehicle = await createVehicleInRepo({
      vehicleName,
      vehicleNumber,
      registrationNumber,
      vehicleType: vehicleType || 'Truck',
      brand,
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
    });

    return sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'A vehicle with this vehicle number already exists');
    }
    next(error);
  }
};

import Driver from '../models/Driver.js';

/**
 * Update a vehicle
 * PUT /api/vehicles/:id
 */
export const updateVehicle = async (req, res, next) => {
  try {
    const vehicleId = req.params.id;
    const updateData = { ...req.body };

    // Fetch the current vehicle state before updating
    const existingVehicle = await getVehicleById(vehicleId);
    if (!existingVehicle) {
      return sendError(res, 404, 'Vehicle not found');
    }

    // Check if assignedDriver is being modified
    if (updateData.assignedDriver !== undefined) {
      const prevDriverId = existingVehicle.assignedDriver;
      const newDriverId = updateData.assignedDriver;

      // Case 1: Unassign the previous driver
      if (prevDriverId && String(prevDriverId) !== String(newDriverId)) {
        await Driver.findByIdAndUpdate(prevDriverId, {
          assignedVehicle: 'Unassigned',
          driverStatus: 'AVAILABLE'
        });
      }

      // Case 2: Assign the new driver
      if (newDriverId && newDriverId !== 'Unassigned') {
        const vehicleNumber = updateData.vehicleNumber || existingVehicle.vehicleNumber;
        const currentStatus = updateData.currentStatus || existingVehicle.currentStatus;
        await Driver.findByIdAndUpdate(newDriverId, {
          assignedVehicle: vehicleNumber,
          driverStatus: currentStatus === 'On Trip' ? 'ON_TRIP' : 'AVAILABLE'
        });
      } else {
        // If 'Unassigned' or empty string is passed, clear from mongoose model
        updateData.assignedDriver = null;
      }
    }

    // Check if status is updated and we need to update the driver's status
    if (updateData.currentStatus !== undefined && !updateData.assignedDriver) {
      const driverId = existingVehicle.assignedDriver;
      if (driverId) {
        await Driver.findByIdAndUpdate(driverId, {
          driverStatus: updateData.currentStatus === 'On Trip' ? 'ON_TRIP' : 'AVAILABLE'
        });
      }
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
