import { z } from 'zod';
import {
  planNameSchema,
  planDescriptionSchema,
  integerCountSchema,
  numericAmountSchema
} from './common.schema.js';

export const subscriptionPlanSchema = z.object({
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
