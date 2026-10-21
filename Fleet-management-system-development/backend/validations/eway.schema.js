import { z } from 'zod';

export const createEWayBillSchema = z.object({
  eWayBillNumber: z.string({ required_error: 'E-Way Bill Number is required' }).trim().min(1, 'E-Way Bill Number is required'),
  vehicleNumber: z.string().trim().optional(),
  fromPlace: z.string().trim().optional(),
  toPlace: z.string().trim().optional(),
  validUntil: z.string().or(z.date()).optional(),
  status: z.enum(['Active', 'Expired', 'Cancelled', 'Extended', '']).optional()
});

export const extendEWayBillSchema = z.object({
  reason: z.string().trim().optional(),
  extendedUntil: z.string().or(z.date()).optional()
});
