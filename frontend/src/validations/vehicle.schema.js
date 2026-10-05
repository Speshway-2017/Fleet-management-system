import { z } from 'zod';
import { numericAmountSchema } from './common.schema.js';

export const vehicleSchema = z.object({
  vehicleNumber: z.string().trim().optional(),
  plateNumber: z.string().trim().optional(),
  vehicleName: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  model: z
    .string({ required_error: 'Model is required.' })
    .trim()
    .min(1, 'Model is required.')
    .min(2, 'Model must be at least 2 characters.')
    .max(50, 'Model must not exceed 50 characters.')
    .refine(val => /^[a-zA-Z0-9\s.'-]+$/.test(val), { message: 'Model contains invalid characters.' })
    .refine(val => /[a-zA-Z0-9]/.test(val), { message: 'Model must contain alphanumeric characters.' })
    .refine(val => !/(.)\1{3,}/i.test(val) && !/([a-zA-Z0-9]{2,4})\1{2,}/i.test(val.replace(/[\s.'-]+/g, '')), { message: 'Repeated characters are not allowed.' }),
  registrationNumber: z
    .string({ required_error: 'Registration Number is required.' })
    .trim()
    .min(1, 'Registration Number is required.')
    .refine(val => /^[A-Z]{2}\s\d{2}\s[A-Z]{2}\s\d{4}$/.test(val), {
      message: 'Registration Number must follow format: TS 76 HG 7576'
    }),
  vehicleType: z.string().trim().optional(),
  type: z.string().trim().optional(),
  fuelType: z.string({ required_error: 'Fuel type is required.' }).trim().min(1, 'Fuel type is required.'),
  chassisNumber: z.string().trim()
    .refine(val => !val || /^[a-zA-Z0-9]+$/.test(val), { message: 'Chassis Number must contain letters and numbers only.' })
    .refine(val => !val || val.length === 17, { message: 'Chassis Number must be exactly 17 characters.' })
    .optional()
    .or(z.literal('')),
  capacity: numericAmountSchema('Capacity').optional(),
  loadCapacity: numericAmountSchema('Load Capacity').optional(),
  fuelCapacity: numericAmountSchema('Fuel Capacity').optional(),
  currentOdometer: numericAmountSchema('Odometer').optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  assignedDriver: z.string().optional().nullable(),
  status: z.string().optional(),
  availability: z.string().optional()
});

