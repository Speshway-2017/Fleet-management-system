import Driver from '../models/Driver.js';

export const getDrivers = async () =>
  Driver.find().sort({ createdAt: -1 });

export const getDriverById = async (id) =>
  Driver.findById(id);

export const createDriverRecord = async (data) => {
  const driver = new Driver(data);
  return driver.save();
};

export const updateDriverRecord = async (id, data) =>
  Driver.findByIdAndUpdate(id, data, { new: true, runValidators: true });

export const deleteDriverRecord = async (id) =>
  Driver.findByIdAndDelete(id);
