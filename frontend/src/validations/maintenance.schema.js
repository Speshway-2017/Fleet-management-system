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

export const updateTicketSchema = z.object({
  status: z.enum(['Open', 'Mechanic Assigned', 'Mechanic Arrived', 'Repair In Progress', 'Repair Completed', 'Need Maintenance', 'Resolved', 'Closed', 'In Progress', 'Rejected', 'Cancelled (Accident)'], {
    required_error: 'Ticket status is required.'
  }),
  mechanicName: z
    .string()
    .trim()
    .max(50, 'Mechanic name cannot exceed 50 characters.')
    .refine((val) => !val || /^[a-zA-Z\s.'-]+$/.test(val), { message: 'Mechanic name can only contain letters, spaces, and hyphens.' })
    .refine((val) => !val || !/(.)\1{3,}/i.test(val), { message: 'Mechanic name contains invalid repeated characters.' })
    .optional(),
  mechanicPhone: z
    .string()
    .trim()
    .refine((val) => !val || /^\d{10}$/.test(val), { message: 'Phone number must be exactly 10 digits.' })
    .refine((val) => !val || /^[6-9]/.test(val), { message: 'Phone number must start with 6, 7, 8, or 9.' })
    .optional(),
  mechanicLocation: z
    .string()
    .trim()
    .max(100, 'Location cannot exceed 100 characters.')
    .refine((val) => !val || /^[a-zA-Z0-9\s,.'/\-#&]+$/.test(val), { message: 'Location contains invalid characters.' })
    .optional(),
  estimatedCost: numericAmountSchema('Estimated cost').optional(),
  actualCost: numericAmountSchema('Actual cost').optional(),
  serviceBillNo: z
    .string()
    .trim()
    .max(30, 'Bill / Invoice number cannot exceed 30 characters.')
    .refine((val) => !val || /^[a-zA-Z0-9\s\-_/]+$/.test(val), { message: 'Bill / Invoice number contains invalid characters.' })
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters.')
    .refine((val) => !val || !/(.)\1{4,}/i.test(val), { message: 'Notes contain invalid repeated characters.' })
    .optional()
});

