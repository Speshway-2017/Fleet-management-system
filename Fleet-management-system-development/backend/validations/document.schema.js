import { z } from 'zod';
import { optionalMongoIdSchema } from './common.schema.js';

export const createDocumentSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).trim().min(1, 'Title is required'),
  documentType: z.string({ required_error: 'Document type is required' }).trim().min(1, 'Document type is required'),
  documentNumber: z.string().trim().optional(),
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  driver: optionalMongoIdSchema('Driver ID'),
  expiryDate: z.string().or(z.date()).optional(),
  notes: z.string().trim().max(500).optional()
});

export const updateDocumentSchema = z.object({
  title: z.string().trim().optional(),
  documentType: z.string().trim().optional(),
  documentNumber: z.string().trim().optional(),
  vehicle: optionalMongoIdSchema('Vehicle ID'),
  driver: optionalMongoIdSchema('Driver ID'),
  expiryDate: z.string().or(z.date()).optional(),
  notes: z.string().trim().max(500).optional()
});
