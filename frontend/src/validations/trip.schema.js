import { z } from 'zod';
import { numericAmountSchema } from './common.schema.js';

export const tripSchema = z.object({
  tripNumber: z.string().trim().optional(),
  vehicle: z.string().optional(),
  vehicleId: z.string().optional(),
  driver: z.string().optional().nullable(),
  driverId: z.string().optional().nullable(),
  startLocation: z.string().trim().min(1, 'Start location is required.').optional(),
  endLocation: z.string().trim().min(1, 'End location is required.').optional(),
  origin: z.union([
    z.string().trim().min(1, 'Origin is required'),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]).optional(),
  destination: z.union([
    z.string().trim().min(1, 'Destination is required'),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]).optional(),
  departureTime: z.string().or(z.date()).optional(),
  eta: z.string().or(z.date()).optional(),
  status: z.string().optional(),
  cargoType: z.string().trim().optional(),
  cargoWeight: numericAmountSchema('Cargo Weight').optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  tripNotes: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(1000).optional()
}).refine(data => data.vehicle || data.vehicleId, {
  message: 'Vehicle is required',
  path: ['vehicle']
});

