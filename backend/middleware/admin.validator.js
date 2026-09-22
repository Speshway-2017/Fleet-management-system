import { validate } from './validate.middleware.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  createManagerSchema,
  updateManagerSchema,
  updateSettingsSchema
} from '../validations/index.js';

export const createOrganizationValidator = validate(createOrganizationSchema);
export const updateOrganizationValidator = validate(updateOrganizationSchema);
export const createManagerValidator = validate(createManagerSchema);
export const updateManagerValidator = validate(updateManagerSchema);
export const updateSettingsValidator = validate(updateSettingsSchema);
