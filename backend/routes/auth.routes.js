import express from 'express';
import {
  changePassword,
  getProfile,
  updateProfile,
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
import { loginRateLimiter, forgotPasswordRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/login', loginRateLimiter, loginValidator, login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePasswordValidator, changePassword);
router.post('/register-admin', registerAdminValidator, registerAdmin);

router.post('/forgot-password', forgotPasswordRateLimiter, forgotPasswordValidator, forgotPassword);
router.post('/verify-otp', verifyOtpValidator, verifyOtp);
router.post('/reset-password', resetPasswordValidator, resetPassword);

export default router;
