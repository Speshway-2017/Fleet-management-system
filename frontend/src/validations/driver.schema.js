import { z } from 'zod';
import { emailSchema, phoneSchema, optionalPhoneSchema, personNameSchema } from './common.schema.js';

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

export const driverSchema = z.object({
  fullName: personNameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema.optional(),
  phone: optionalPhoneSchema,
  licenseNumber: z.string({ required_error: 'License number is required' }).trim().min(3, 'License number is required'),
  licenseType: z.string().trim().optional(),
  licenseExpiry: z.string().or(z.date()).optional(),
  assignedVehicle: z.string().optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  emergencyContact: optionalPhoneSchema,
  experience: experienceSchema,
  driverStatus: z.string().optional(),
  status: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().trim().optional(),
  driverLocation: z.string().trim().optional()
});

