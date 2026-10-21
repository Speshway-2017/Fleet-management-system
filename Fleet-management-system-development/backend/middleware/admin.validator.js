import { validate } from './validate.middleware.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  createManagerSchema,
  updateManagerSchema,
  updateSettingsSchema,
  blogSchema,
  aboutSchema,
  adminProfileSchema,
  securitySettingsSchema,
  notificationSettingsSchema
} from '../validations/index.js';

export const createOrganizationValidator = validate(createOrganizationSchema);
export const updateOrganizationValidator = validate(updateOrganizationSchema);
export const createManagerValidator = validate(createManagerSchema);
export const updateManagerValidator = validate(updateManagerSchema);
export const updateSettingsValidator = validate(updateSettingsSchema);
export const blogValidator = validate(blogSchema);
export const aboutValidator = validate(aboutSchema);
export const adminProfileValidator = validate(adminProfileSchema);
export const securitySettingsValidator = validate(securitySettingsSchema);
export const notificationSettingsValidator = validate(notificationSettingsSchema);


