import { z } from 'zod';

export const createReportSchema = z.object({
  name: z
    .string({ required_error: 'Schedule name is required.' })
    .trim()
    .min(3, 'Schedule name must be at least 3 characters.')
    .max(60, 'Schedule name cannot exceed 60 characters.'),
  type: z.enum(['Operational', 'Financial', 'Compliance', 'Safety']).default('Operational'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly']).default('Weekly'),
  day: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(['PDF', 'CSV', 'Excel', 'XLSX']).default('PDF'),
  recipients: z
    .string({ required_error: 'Recipient email(s) are required.' })
    .trim()
    .max(255, 'Recipients list cannot exceed 255 characters.'),
  status: z.enum(['Active', 'Paused']).default('Active')
});

export const updateReportSchema = z.object({
  name: z.string().trim().min(3).max(60).optional(),
  type: z.enum(['Operational', 'Financial', 'Compliance', 'Safety']).optional(),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly']).optional(),
  day: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(['PDF', 'CSV', 'Excel', 'XLSX']).optional(),
  recipients: z.string().trim().max(255).optional(),
  status: z.enum(['Active', 'Paused']).optional()
});
