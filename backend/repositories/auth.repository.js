import User from '../models/User.js';

export const findUserByEmail = async (email) => User.findOne({ email });

export const createUser = async (userData) => {
  const user = new User(userData);
  return user.save();
};

export const findUserById = async (id) => User.findById(id).select('-password');
