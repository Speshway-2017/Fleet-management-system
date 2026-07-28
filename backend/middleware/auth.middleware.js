import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select('-password');

    if (!user) {
      const Driver = (await import('../models/Driver.js')).default;
      const driverDoc = await Driver.findById(decoded.id).select('-password');
      if (driverDoc) {
        user = driverDoc.toObject();
        user._id = driverDoc._id;
        user.role = 'DRIVER';
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User or Driver not found' });
    }

    // Dynamic subscription check
    if (user.role === 'FLEET_MANAGER') {
      if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionExpiry && new Date() > new Date(user.subscriptionExpiry)) {
        user.subscriptionStatus = 'EXPIRED';
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message, error.stack);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
