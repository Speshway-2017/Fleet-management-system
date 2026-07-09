import express from 'express';
import { changePassword, getProfile, login, logout, registerAdmin } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', protect, getProfile);
router.patch('/change-password', protect, changePassword);
router.post('/register-admin', registerAdmin);

export default router;
