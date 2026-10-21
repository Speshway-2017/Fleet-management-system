import Driver from '../models/Driver.js';

export const getDrivers = async (filter = {}) =>
  Driver.find(filter).sort({ createdAt: -1 });

export const getDriverById = async (id) =>
  Driver.findById(id);

export const createDriverRecord = async (data) => {
  const driver = new Driver(data);
  return driver.save();
};

export const updateDriverRecord = async (id, data) => {
  const driver = await Driver.findById(id);
  if (!driver) return null;
  Object.assign(driver, data);
  return driver.save();
};

export const deleteDriverRecord = async (id) =>
  Driver.findByIdAndDelete(id);
