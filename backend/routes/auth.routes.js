import express from 'express';
import {
  changePassword,
  getProfile,
  login,
  logout,
  registerAdmin,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  loginValidator,
  changePasswordValidator,
  registerAdminValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
} from '../middleware/auth.validator.js';

const router = express.Router();

router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.patch('/change-password', protect, changePasswordValidator, changePassword);
router.post('/register-admin', registerAdminValidator, registerAdmin);

router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/verify-otp', verifyOtpValidator, verifyOtp);
router.post('/reset-password', resetPasswordValidator, resetPassword);

export default router;
