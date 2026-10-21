import { z } from 'zod';
import { optionalMongoIdSchema, numericAmountSchema } from './common.schema.js';

export const createFuelSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  vehicleId: z.string().optional(),
  driver: optionalMongoIdSchema('Driver ID'),
  trip: optionalMongoIdSchema('Trip ID'),
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

export const updateFuelSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  vehicleId: z.string().optional(),
  driver: optionalMongoIdSchema('Driver ID'),
  trip: optionalMongoIdSchema('Trip ID'),
  fuelType: z.string().trim().optional(),
  liters: numericAmountSchema('Liters/Quantity').optional(),
  amount: numericAmountSchema('Amount/Cost').optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  fuelStation: z.string().trim().optional(),
  purchaseCity: z.string().trim().max(50).optional(),
  status: z.string().optional(),
  hasReceipt: z.boolean().optional(),
  approvalStatus: z.enum(['Pending', 'Approved', 'Rejected', 'Verified', '']).optional(),
  notes: z.string().trim().max(500).optional()
});

