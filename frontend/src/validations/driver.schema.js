import { z } from 'zod';
import { emailSchema, phoneSchema, optionalPhoneSchema, personNameSchema } from './common.schema.js';

export const driverSchema = z.object({
  fullName: personNameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema.optional().or(z.string().trim().length(10, 'Phone number must be exactly 10 digits.')),
  phone: optionalPhoneSchema,
  licenseNumber: z.string({ required_error: 'License number is required' }).trim().min(3, 'License number is required'),
  licenseType: z.string().trim().optional(),
  licenseExpiry: z.string().or(z.date()).optional(),
  assignedVehicle: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  emergencyContact: optionalPhoneSchema,
  driverStatus: z.string().optional(),
  status: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().trim().optional(),
  driverLocation: z.string().trim().optional()
});

