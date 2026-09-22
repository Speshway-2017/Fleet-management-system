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
  passwordSchema,
  mongoIdSchema,
  optionalMongoIdSchema
} from './common.schema.js';

export const managerItemSchema = z.object({
  name: managerNameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema
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
  plan: z.enum(['Enterprise', 'Professional', 'Standard', '']).optional().nullable(),
  status: z.enum(['Active', 'Pending', 'Suspended', '']).optional().nullable(),
  managers: z.array(managerItemSchema).optional()
});

export const updateOrganizationSchema = z.object({
  name: z.string().trim().max(20, 'Organization name must not exceed 20 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Organization name must contain alphabets only.' })
    .optional(),
  email: z.string().trim().max(30, 'Email address must not exceed 30 characters.')
    .refine((val) => !val || !/\s/.test(val), { message: 'Email address must not contain spaces.' })
    .refine((val) => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid email address.'
    })
    .optional(),
  industry: z.string().trim().max(20, 'Industry must not exceed 20 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Industry must contain alphabets only.' })
    .optional(),
  phone: z.string().trim()
    .refine((val) => !val || /^\d+$/.test(val), { message: 'Phone number must contain numbers only.' })
    .refine((val) => !val || val.length === 10, { message: 'Phone number must be exactly 10 digits.' })
    .optional()
    .nullable(),
  address: streetAddressSchema,
  city: citySchema,
  state: stateSchema,
  country: countrySchema,
  plan: z.enum(['Enterprise', 'Professional', 'Standard', '']).optional().nullable(),
  status: z.enum(['Active', 'Pending', 'Suspended', '']).optional().nullable()
});

export const createManagerSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name is required').max(50, 'Name must not exceed 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional().nullable(),
  organization: mongoIdSchema('Organization ID')
});

export const updateManagerSchema = z.object({
  name: z.string().trim().max(50, 'Name must not exceed 50 characters').optional(),
  email: emailSchema.optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  phone: phoneSchema.optional().nullable(),
  organization: optionalMongoIdSchema('Organization ID')
});
