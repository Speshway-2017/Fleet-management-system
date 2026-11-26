import { z } from 'zod';
import { numericAmountSchema } from './common.schema.js';

export const fuelSchema = z.object({
  vehicle: z.string().optional().nullable(),
  vehicleId: z.string().optional().nullable(),
  driver: z.string().optional().nullable(),
  trip: z.string().optional().nullable(),
  fuelType: z.string().trim().optional(),
  liters: numericAmountSchema('Liters/Quantity'),
  amount: numericAmountSchema('Amount/Cost'),
  odometer: numericAmountSchema('Odometer').optional(),
  fuelStation: z.string().trim().optional(),
  purchaseCity: z.string().trim().max(50).optional(),
  date: z.string().or(z.date()).optional(),
  status: z.string().optional(),
  hasReceipt: z.boolean().optional(),
  notes: z.string().trim().max(500).optional()
});

