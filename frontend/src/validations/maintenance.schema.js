import { z } from 'zod';
import { numericAmountSchema } from './common.schema.js';

export const maintenanceSchema = z.object({
  vehicle: z.string().optional().nullable(),
  serviceType: z.string({ required_error: 'Service type is required' }).trim().min(1, 'Service type is required'),
  cost: numericAmountSchema('Cost').optional(),
  serviceDate: z.string().or(z.date()).optional(),
  odometer: numericAmountSchema('Odometer').optional(),
  vendor: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  status: z.string().optional()
});

export const ticketComplaintSchema = z.object({
  vehicle: z.string().optional().nullable(),
  category: z.string().trim().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'Low', 'Medium', 'High', '']).optional(),
  subject: z.string().trim().min(1, 'Subject is required').optional(),
  description: z.string().trim().min(1, 'Description is required').optional()
});
