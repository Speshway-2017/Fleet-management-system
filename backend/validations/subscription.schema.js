import { z } from 'zod';
import {
  planNameSchema,
  planDescriptionSchema,
  integerCountSchema,
  numericAmountSchema,
  mongoIdSchema
} from './common.schema.js';

export const createSubscriptionPlanSchema = z.object({
  name: planNameSchema,
  price: numericAmountSchema('Monthly Price'),
  duration: integerCountSchema('Duration (Days)'),
  description: planDescriptionSchema,
  status: z.enum(['Active', 'Inactive']).optional(),
  displayOrder: integerCountSchema('Display Order').optional(),
  features: z
    .array(
      z.string({ invalid_type_error: 'Feature must be text.' })
        .trim()
        .min(2, 'Each feature must be at least 2 characters.')
        .max(100, 'Each feature must not exceed 100 characters.')
    )
    .max(20, 'Maximum 20 features allowed.')
    .optional(),
  maxVehicles: integerCountSchema('Number of Vehicles'),
  maxDrivers: integerCountSchema('Number of Drivers'),
  maxTrips: integerCountSchema('Number of Trips').optional(),
  isPopular: z.boolean().optional(),
  color: z.string().optional()
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, 'Plan name must be at least 2 characters.').max(50, 'Plan name must not exceed 50 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Plan name must contain alphabets only.' })
    .optional(),
  price: numericAmountSchema('Monthly Price').optional(),
  duration: integerCountSchema('Duration (Days)').optional(),
  description: z.string().trim().min(5, 'Description must be at least 5 characters.').max(100, 'Description must not exceed 100 characters.')
    .refine((val) => !val || !/\d/.test(val), { message: 'Description must not contain numbers.' })
    .optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  displayOrder: integerCountSchema('Display Order').optional(),
  features: z
    .array(
      z.string({ invalid_type_error: 'Feature must be text.' })
        .trim()
        .min(2, 'Each feature must be at least 2 characters.')
        .max(100, 'Each feature must not exceed 100 characters.')
    )
    .max(20, 'Maximum 20 features allowed.')
    .optional(),
  maxVehicles: integerCountSchema('Number of Vehicles').optional(),
  maxDrivers: integerCountSchema('Number of Drivers').optional(),
  maxTrips: integerCountSchema('Number of Trips').optional(),
  isPopular: z.boolean().optional(),
  color: z.string().optional()
});

export const requestSubscriptionSchema = z.object({
  planId: mongoIdSchema('Plan ID'),
  billingCycle: z.enum(['monthly', 'yearly', 'annual']).optional(),
  notes: z.string().trim().max(500).optional()
});
