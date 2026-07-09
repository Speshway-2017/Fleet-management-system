import Vehicle from '../models/Vehicle.js';

export const getVehicles = async () => Vehicle.find();

export const createVehicle = async (data) => {
  const vehicle = new Vehicle(data);
  return vehicle.save();
};
