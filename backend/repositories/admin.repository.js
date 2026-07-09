import User from '../models/User.js';

export const getAllManagers = async () => {
  return User.find({ role: 'FLEET_MANAGER' }).select('-password');
};

export const createManager = async (managerData) => {
  const manager = new User({ ...managerData, role: 'FLEET_MANAGER' });
  return manager.save();
};

export const getManagerById = async (id) => {
  return User.findOne({ _id: id, role: 'FLEET_MANAGER' }).select('-password');
};
