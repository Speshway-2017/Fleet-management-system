import { body, validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return sendError(res, 400, errors.array()[0].msg);
  };
};

export const loginValidator = validate([
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
]);

export const changePasswordValidator = validate([
  body('oldPassword').notEmpty().withMessage('Old password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
]);

export const registerAdminValidator = validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
]);

export const forgotPasswordValidator = validate([
  body('email').isEmail().withMessage('Valid email is required'),
]);

export const verifyOtpValidator = validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
]);

export const resetPasswordValidator = validate([
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
]);
