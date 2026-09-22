import { z } from 'zod';
import { optionalMongoIdSchema, numericAmountSchema } from './common.schema.js';

export const createMaintenanceSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  serviceType: z.string({ required_error: 'Service type is required' }).trim().min(1, 'Service type is required'),
  cost: numericAmountSchema('Cost').optional(),
  serviceDate: z.string().or(z.date()).optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  vendor: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled', '']).optional()
});

export const updateMaintenanceSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  serviceType: z.string().trim().optional(),
  cost: numericAmountSchema('Cost').optional(),
  serviceDate: z.string().or(z.date()).optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  vendor: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled', '']).optional()
});

export const vehicleComplaintSchema = z.object({
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  driver: optionalMongoIdSchema('Driver ID'),
  category: z.string().trim().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'Low', 'Medium', 'High', '']).optional(),
  subject: z.string().trim().min(1, 'Subject is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional(),
  status: z.enum(['Open', 'In Progress', 'Need Maintenance', 'Repair In Progress', 'Repair Completed', 'Resolved', 'Rejected', 'Completed', '']).optional()
});
