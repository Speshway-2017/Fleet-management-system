import { z } from 'zod';
import {
  planNameSchema,
  planDescriptionSchema,
  integerCountSchema,
  numericAmountSchema,
  mongoIdSchema
} from './common.schema.js';

export const planFeatureSchema = z
  .string({ invalid_type_error: 'Feature must be text.' })
  .trim()
  .min(2, 'Each feature must be at least 2 characters.')
  .max(100, 'Each feature must not exceed 100 characters.')
  .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Feature contains excessive repeated characters.' })
  .refine((val) => !/([a-zA-Z]{2,4})\1{2,}/i.test(val.replace(/\s+/g, '')), { message: 'Feature contains repetitive patterns.' })
  .refine((val) => /[a-zA-Z]/.test(val), { message: 'Each feature must contain meaningful text.' });

export const createSubscriptionPlanSchema = z.object({
  name: planNameSchema,
  price: numericAmountSchema('Monthly Price'),
  duration: integerCountSchema('Duration (Days)').refine((val) => val >= 1, { message: 'Duration must be at least 1 day.' }),
  description: planDescriptionSchema,
  status: z.enum(['Active', 'Inactive']).optional(),
  displayOrder: integerCountSchema('Display Order').optional(),
  features: z
    .array(planFeatureSchema)
    .max(20, 'Maximum 20 features allowed.')
    .optional(),
  maxVehicles: integerCountSchema('Number of Vehicles'),
  maxDrivers: integerCountSchema('Number of Drivers'),
  maxTrips: integerCountSchema('Number of Trips').optional(),
  isPopular: z.boolean().optional(),
  color: z.string().optional()
});

export const updateSubscriptionPlanSchema = z.object({
  name: planNameSchema.optional(),
  price: numericAmountSchema('Monthly Price').optional(),
  duration: integerCountSchema('Duration (Days)').refine((val) => val === undefined || val >= 1, { message: 'Duration must be at least 1 day.' }).optional(),
  description: planDescriptionSchema.optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  displayOrder: integerCountSchema('Display Order').optional(),
  features: z
    .array(planFeatureSchema)
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
