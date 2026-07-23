import {
  loginUser,
  getUserProfile,
  changeUserPassword,
  createAdmin,
  processForgotPassword,
  verifyUserOtp,
  resetUserPassword
} from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAction } from '../services/audit.service.js';
import User from '../models/User.js';

export const login = async (req, res, next) => {
  try {
    const data = await loginUser(req.body);
    await logAction({
      user: data.user.email,
      action: 'Login Successful',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    return sendSuccess(res, 200, data, 'Login successful');
  } catch (error) {
    if (error.message === 'No account found with this email' || error.message === 'Incorrect password' || error.message === 'Role mismatch') {
      await logAction({
        user: req.body.email || 'Unknown',
        action: 'Failed Login Attempt',
        ipAddress: req.ip || req.headers['x-forwarded-for'],
        status: 'Failed',
        details: { reason: error.message }
      });
      return sendError(res, 401, error.message);
    }
    next(error);
  }
};

export const logout = async (req, res) => {
  await logAction({
    user: req.user ? req.user.email : 'Unknown',
    action: 'Logout',
    ipAddress: req.ip || req.headers['x-forwarded-for'],
    status: 'Success'
  });
  return sendSuccess(res, 200, {}, 'Logout successful');
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.user._id);
    return sendSuccess(res, 200, user, 'Profile fetched');
  } catch (error) {
    if (error.message === 'User not found') {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, profileImage, jobTitle, primaryHub } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, 404, 'User not found');

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (primaryHub !== undefined) user.primaryHub = primaryHub;

    await user.save();

    const updated = user.toObject();
    delete updated.password;

    return sendSuccess(res, 200, updated, 'Profile updated successfully');
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, 'Email address is already in use');
    }
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changeUserPassword(req.user.email, oldPassword, newPassword);
    await logAction({
      user: req.user.email,
      action: 'Password Changed',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    return sendSuccess(res, 200, {}, 'Password changed successfully');
  } catch (error) {
    if (error.message === 'Old password is incorrect' || error.message === 'User not found') {
      return sendError(res, 401, error.message);
    }
    next(error);
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const data = await createAdmin(req.body);
    return sendSuccess(res, 201, data, 'Super admin created');
  } catch (error) {
    if (error.message === 'User already exists') {
      return sendError(res, 409, error.message);
    }
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await processForgotPassword(email);
    await logAction({
      user: email,
      action: 'Forgot Password Requested',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    return sendSuccess(res, 200, {}, 'OTP sent to email');
  } catch (error) {
    if (error.message === 'No user found with this email') {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await verifyUserOtp(email, otp);
    return sendSuccess(res, 200, {}, 'OTP verified successfully');
  } catch (error) {
    if (error.message === 'Invalid or expired OTP') {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await resetUserPassword(email, otp, newPassword);
    await logAction({
      user: email,
      action: 'Password Reset',
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      status: 'Success'
    });
    return sendSuccess(res, 200, {}, 'Password reset successfully');
  } catch (error) {
    if (error.message === 'Invalid or expired OTP') {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};
