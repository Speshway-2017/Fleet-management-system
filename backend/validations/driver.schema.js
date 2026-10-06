import { z } from 'zod';
import { emailSchema, phoneSchema, optionalPhoneSchema, personNameSchema, optionalMongoIdSchema } from './common.schema.js';

export const experienceSchema = z
  .union([z.string(), z.number()])
  .optional()
  .refine(
    (val) => {
      if (val === undefined || val === null || val === '') return true;
      const str = String(val).trim();
      if (!/^\d+$/.test(str)) return false;
      const num = Number(str);
      return num >= 0 && num <= 50;
    },
    {
      message: 'Years of experience must be a valid whole number between 0 and 50.'
    }
  );

export const createDriverSchema = z.object({
  fullName: personNameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  phoneNumber: phoneSchema.optional(),
  licenseNumber: z.string({ required_error: 'License number is required' }).trim().min(3, 'License number is required'),
  assignedVehicle: optionalMongoIdSchema('Vehicle ID'),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  emergencyContact: optionalPhoneSchema,
  experience: experienceSchema,
  status: z.string().optional()
});

export const updateDriverSchema = z.object({
  fullName: z.string().trim().max(50, 'Name must not exceed 50 characters').optional(),
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  phoneNumber: phoneSchema.optional(),
  licenseNumber: z.string().trim().min(3).optional(),
  assignedVehicle: optionalMongoIdSchema('Vehicle ID'),
  emergencyContact: optionalPhoneSchema,
  experience: experienceSchema,
  status: z.string().optional()
});

