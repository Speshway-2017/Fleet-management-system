import { validate } from './validate.middleware.js';
import {
  loginSchema,
  changePasswordSchema,
  registerAdminSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema
} from '../validations/index.js';

export const loginValidator = validate(loginSchema);
export const changePasswordValidator = validate(changePasswordSchema);
export const registerAdminValidator = validate(registerAdminSchema);
export const forgotPasswordValidator = validate(forgotPasswordSchema);
export const verifyOtpValidator = validate(verifyOtpSchema);
export const resetPasswordValidator = validate(resetPasswordSchema);
