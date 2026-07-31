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

export const findUserById = async (id) => User.findById(id).select('-password');

export const updateUser = async (userId, updateData) => {
  return User.findByIdAndUpdate(userId, updateData, { new: true });
};
