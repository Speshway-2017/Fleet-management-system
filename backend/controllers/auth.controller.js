import { createUser, findUserByEmail, findUserById } from '../repositories/auth.repository.js';
import { comparePassword, hashPassword } from '../utils/hashPassword.js';
import { generateToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await findUserByEmail(email);
    if (!user) return sendError(res, 401, 'Invalid credentials');

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) return sendError(res, 401, 'Invalid credentials');

    if (role && user.role !== role) {
      return sendError(res, 403, 'Role mismatch');
    }

    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, 200, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  return sendSuccess(res, 200, {}, 'Logout successful');
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user._id);
    return sendSuccess(res, 200, user, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await findUserByEmail(req.user.email);

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) return sendError(res, 401, 'Old password is incorrect');

    user.password = await hashPassword(newPassword);
    await user.save();

    return sendSuccess(res, 200, {}, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await findUserByEmail(email);

    if (existing) return sendError(res, 409, 'User already exists');

    const hashedPassword = await hashPassword(password);
    const user = await createUser({ name, email, password: hashedPassword, role: 'SUPER_ADMIN' });

    return sendSuccess(res, 201, { id: user._id, name: user.name, email: user.email, role: user.role }, 'Super admin created');
  } catch (error) {
    next(error);
  }
};
