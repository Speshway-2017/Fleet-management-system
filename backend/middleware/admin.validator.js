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

export const createOrganizationValidator = validate([
  body('name').notEmpty().withMessage('Organization name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('industry').notEmpty().withMessage('Industry is required').trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('plan').optional().isIn(['Enterprise', 'Professional', 'Standard', '']).withMessage('Invalid subscription plan'),
  body('status').optional().isIn(['Active', 'Pending', 'Suspended', '']).withMessage('Invalid status')
]);

export const updateOrganizationValidator = validate([
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('industry').optional().trim(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('country').optional().trim(),
  body('plan').optional().isIn(['Enterprise', 'Professional', 'Standard', '']).withMessage('Invalid subscription plan'),
  body('status').optional().isIn(['Active', 'Pending', 'Suspended', '']).withMessage('Invalid status')
]);

export const createManagerValidator = validate([
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().trim(),
  body('organization').notEmpty().withMessage('Organization ID is required').isMongoId().withMessage('Invalid Organization ID'),
]);

export const updateManagerValidator = validate([
  body('name').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone').optional().trim(),
  body('organization').optional().isMongoId().withMessage('Invalid Organization ID'),
]);

export const updateSettingsValidator = validate([
  body('globalSettings').optional().isObject(),
]);
