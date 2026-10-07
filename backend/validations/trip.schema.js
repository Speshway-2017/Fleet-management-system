import { z } from 'zod';
import { mongoIdSchema, optionalMongoIdSchema, numericAmountSchema } from './common.schema.js';

export const createTripSchema = z.object({
  tripNumber: z.string().trim().optional(),
  vehicle: mongoIdSchema('Vehicle ID'),
  driver: mongoIdSchema('Driver ID'),
  origin: z.union([
    z.string().trim().min(1, 'Origin is required'),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]),
  destination: z.union([
    z.string().trim().min(1, 'Destination is required'),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]),
  cargoType: z.string().trim().optional(),
  cargoWeight: numericAmountSchema('Cargo Weight').optional(),
  scheduledDate: z.string().or(z.date()).optional(),
  notes: z.string().trim().max(1000).optional()
});

export const updateTripSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  driver: optionalMongoIdSchema('Driver ID'),
  origin: z.union([
    z.string().trim(),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]).optional(),
  destination: z.union([
    z.string().trim(),
    z.object({
      address: z.string().optional(),
      coordinates: z.array(z.number()).optional()
    })
  ]).optional(),
  status: z.enum([
    'Draft',
    'Pending Driver Acceptance',
    'Scheduled',
    'Assigned',
    'Accepted',
    'Rejected',
    'In Progress',
    'Delayed',
    'On Transit',
    'In Transit',
    'En Route',
    'Dispatched',
    'Customer Location Reached',
    'Waiting for Manager Approval',
    'Completed',
    'Cancelled',
    'On Trip',
    'Ready to Dispatch',
    ''
  ]).optional(),
  cargoType: z.string().trim().optional(),
  cargoWeight: numericAmountSchema('Cargo Weight').optional(),
  notes: z.string().trim().max(1000).optional()
});

export const tripChatSchema = z.object({
  message: z.string({ required_error: 'Message is required' }).trim().min(1, 'Message cannot be empty')
});

export const callLogSchema = z.object({
  duration: z.number().int().nonnegative().optional(),
  status: z.string().optional()
});
