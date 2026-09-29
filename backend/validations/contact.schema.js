import { z } from 'zod';
import { emailSchema } from './common.schema.js';

export const contactRequestSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be between 2 and 100 characters long')
    .max(100, 'Full name must be between 2 and 100 characters long')
    .refine((val) => !/\d/.test(val), { message: 'Numbers are not allowed in full name' }),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^\d+$/.test(val), { message: 'Phone number must contain only numbers' })
    .refine((val) => !val || (val.length >= 10 && val.length <= 15), {
      message: 'Phone number must be between 10 and 15 digits long'
    })
    .optional()
    .nullable(),
  company: z
    .string()
    .trim()
    .max(100, 'Company name cannot exceed 100 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  subject: z.enum(['Sales', 'Demo', 'Support', 'Partnership'], {
    errorMap: () => ({ message: 'Subject must be one of: Sales, Demo, Support, Partnership' })
  }),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(1, 'Message is required')
    .min(10, 'Message must be between 10 and 1,000 characters long')
    .max(1000, 'Message must be between 10 and 1,000 characters long'),
  captchaToken: z.string().optional().nullable(),
  recaptchaToken: z.string().optional().nullable()
}).passthrough();
