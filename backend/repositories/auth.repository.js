import User from '../models/User.js';
import Driver from '../models/Driver.js';

export const findUserByEmail = async (email) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = await Driver.findOne({ email }).select('+password');
  }
  return user;
};

export const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

export const findUserById = async (id) => {
  let user = await User.findById(id).select('-password');
  if (!user) {
    const driver = await Driver.findById(id).select('-password');
    if (driver) {
      user = driver.toObject();
      user.id = driver._id;
      user.role = 'DRIVER';
    }
  }
  return user;
};

export const updateUser = async (userId, updateData) => {
  let user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) {
    user = await Driver.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  }
  return user;
};
