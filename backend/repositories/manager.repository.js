import Vehicle from '../models/Vehicle.js';

export const getVehicles = async () =>
  Vehicle.find().sort({ createdAt: -1 });

export const getVehicleById = async (id) =>
  Vehicle.findById(id);

export const createVehicle = async (data) => {
  const vehicle = new Vehicle(data);
  return vehicle.save();
};

export const updateVehicle = async (id, data) =>
  Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteVehicle = async (id) =>
  Vehicle.findByIdAndDelete(id);
