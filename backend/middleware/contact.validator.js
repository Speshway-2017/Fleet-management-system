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

export const contactRequestValidator = validate([
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters long'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits long')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isIn(['Sales', 'Demo', 'Support', 'Partnership'])
    .withMessage('Subject must be one of: Sales, Demo, Support, Partnership'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters long'),
]);
