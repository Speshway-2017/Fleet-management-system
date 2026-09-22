import { z } from 'zod';
import { emailSchema, phoneSchema, optionalPhoneSchema, personNameSchema, optionalMongoIdSchema } from './common.schema.js';

export const createDriverSchema = z.object({
  fullName: personNameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  phoneNumber: phoneSchema.optional().or(z.string().trim().length(10, 'Phone number must be exactly 10 digits.')),
  licenseNumber: z.string({ required_error: 'License number is required' }).trim().min(3, 'License number is required'),
  assignedVehicle: optionalMongoIdSchema('Vehicle ID'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  emergencyContact: optionalPhoneSchema,
  status: z.string().optional()
});

export const updateDriverSchema = z.object({
  fullName: z.string().trim().max(50, 'Name must not exceed 50 characters').optional(),
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  phoneNumber: phoneSchema.optional().or(z.string().trim().length(10, 'Phone number must be exactly 10 digits.')).optional(),
  licenseNumber: z.string().trim().min(3).optional(),
  assignedVehicle: optionalMongoIdSchema('Vehicle ID'),
  emergencyContact: optionalPhoneSchema,
  status: z.string().optional()
});

