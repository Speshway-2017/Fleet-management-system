import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Trip from '../models/Trip.js';
import Fuel from '../models/Fuel.js';
import Maintenance from '../models/Maintenance.js';
import Document from '../models/Document.js';
import Report from '../models/Report.js';

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
