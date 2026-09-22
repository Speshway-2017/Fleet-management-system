import { z } from 'zod';
import {
  orgNameSchema,
  industrySchema,
  emailSchema,
  phoneSchema,
  streetAddressSchema,
  citySchema,
  stateSchema,
  countrySchema,
  managerNameSchema,
  passwordSchema
} from './common.schema.js';

export const managerItemSchema = z.object({
  name: managerNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string({ required_error: 'Confirm password is required.' }).min(1, 'Confirm password is required.'),
  phone: phoneSchema,
  showPassword: z.boolean().optional(),
  showConfirmPassword: z.boolean().optional()
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export const createOrganizationSchema = z.object({
  name: orgNameSchema,
  email: emailSchema,
  industry: industrySchema,
  phone: phoneSchema,
  address: streetAddressSchema.optional(),
  city: citySchema.optional(),
  state: stateSchema.optional(),
  country: countrySchema.optional(),
  plan: z.string().optional(),
  status: z.string().optional(),
  managers: z.array(managerItemSchema).optional()
});

export const updateOrganizationSchema = z.object({
  name: orgNameSchema,
  email: emailSchema,
  industry: industrySchema,
  phone: phoneSchema,
  address: streetAddressSchema.optional(),
  city: citySchema.optional(),
  state: stateSchema.optional(),
  country: countrySchema.optional(),
  plan: z.string().optional(),
  status: z.string().optional()
});
