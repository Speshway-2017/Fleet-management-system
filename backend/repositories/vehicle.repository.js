import Vehicle from '../models/Vehicle.js';

export const getVehicles = async (filter = {}) =>
  Vehicle.find(filter)
    .populate('assignedDriver')
    .populate('assignedManager')
    .populate('createdBy')
    .populate('updatedBy')
    .sort({ createdAt: -1 });

export const getVehicleById = async (id) =>
  Vehicle.findById(id)
    .populate('assignedDriver')
    .populate('assignedManager')
    .populate('createdBy')
    .populate('updatedBy');

export const createVehicle = async (data) => {
  const vehicle = new Vehicle(data);
  return vehicle.save();
};

export const updateVehicle = async (id, data) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) return null;
  Object.assign(vehicle, data);
  const saved = await vehicle.save();
  return Vehicle.findById(saved._id)
    .populate('assignedDriver')
    .populate('assignedManager')
    .populate('createdBy')
    .populate('updatedBy');
};

export const deleteVehicle = async (id) =>
  Vehicle.findByIdAndDelete(id);
