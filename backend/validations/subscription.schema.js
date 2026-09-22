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
  price: numericAmountSchema('Price'),
  duration: z.string({ required_error: 'Duration is required.' }).trim().min(1, 'Duration is required.'),
  description: planDescriptionSchema,
  features: z.array(z.string()).optional(),
  maxVehicles: integerCountSchema('Number of Vehicles'),
  maxDrivers: integerCountSchema('Number of Drivers'),
  maxTrips: integerCountSchema('Number of Trips').optional(),
  isPopular: z.boolean().optional(),
  color: z.string().optional()
});

export const updateSubscriptionPlanSchema = z.object({
  name: z.string().trim().max(50, 'Plan name must not exceed 50 characters.')
    .refine((val) => !val || !/\d/.test(val), { message: 'Plan name must not contain numbers.' })
    .optional(),
  price: numericAmountSchema('Price').optional(),
  duration: z.string().trim().optional(),
  description: z.string().trim().max(100, 'Description must not exceed 100 characters.')
    .refine((val) => !val || !/\d/.test(val), { message: 'Description must not contain numbers.' })
    .optional(),
  features: z.array(z.string()).optional(),
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
