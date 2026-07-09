import {
  createVehicle as createVehicleInRepo,
  getVehicles,
  getVehicleById as getVehicleByIdInRepo,
  updateVehicle as updateVehicleInRepo,
  deleteVehicle as deleteVehicleInRepo,
} from '../repositories/manager.repository.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getDashboard = async (_req, res) => {
  return sendSuccess(res, 200, { message: 'Manager dashboard ready' }, 'Dashboard loaded');
};

export const listVehicles = async (_req, res, next) => {
  try {
    const vehicles = await getVehicles();
    return sendSuccess(res, 200, vehicles, 'Vehicles fetched');
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
    next(error);
  }
};
