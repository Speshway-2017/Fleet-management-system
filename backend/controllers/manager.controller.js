import { createVehicle as createVehicleInRepo, getVehicles } from '../repositories/manager.repository.js';
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
    const { vehicleNumber, model, brand, year } = req.body;

    if (!vehicleNumber || !model || !brand) {
      return sendError(res, 400, 'Vehicle number, model, and brand are required');
    }

    const vehicle = await createVehicleInRepo({ vehicleNumber, model, brand, year, assignedManager: req.user._id });
    return sendSuccess(res, 201, vehicle, 'Vehicle created');
  } catch (error) {
    next(error);
  }
};
