import { z } from 'zod';
import {
  planNameSchema,
  planDescriptionSchema,
  integerCountSchema,
  numericAmountSchema
} from './common.schema.js';

export const subscriptionPlanSchema = z.object({
  name: planNameSchema,
  price: numericAmountSchema('Monthly Price'),
  duration: integerCountSchema('Duration (Days)'),
  description: planDescriptionSchema,
  status: z.enum(['Active', 'Inactive']).optional(),
  displayOrder: integerCountSchema('Display Order').optional(),
  maxVehicles: integerCountSchema('Number of Vehicles'),
  maxDrivers: integerCountSchema('Number of Drivers'),
  maxTrips: integerCountSchema('Number of Trips').optional(),
  features: z
    .array(
      z.string({ invalid_type_error: 'Feature must be text.' })
        .trim()
        .min(2, 'Each feature must be at least 2 characters.')
        .max(100, 'Each feature must not exceed 100 characters.')
    )
    .max(20, 'Maximum 20 features allowed.')
    .optional(),
  featuresText: z
    .string()
    .max(1000, 'Features must not exceed 1000 characters.')
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const lines = val.split('\n').map((l) => l.trim()).filter(Boolean);
        return lines.every((l) => l.length >= 2 && l.length <= 100);
      },
      { message: 'Each feature line must be between 2 and 100 characters.' }
    )
    .refine(
      (val) => {
        if (!val || !val.trim()) return true;
        const lines = val.split('\n').map((l) => l.trim()).filter(Boolean);
        return lines.length <= 20;
      },
      { message: 'Maximum 20 features allowed.' }
    )
    .optional(),
  isPopular: z.boolean().optional(),
  color: z.string().optional()
});
