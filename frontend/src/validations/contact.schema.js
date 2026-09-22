import { z } from 'zod';
import { emailSchema } from './common.schema.js';

export const contactRequestSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be between 2 and 100 characters long')
    .max(100, 'Full name must be between 2 and 100 characters long')
    .refine((val) => !/\d/.test(val), { message: 'Full name must not contain numbers' }),
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
  subject: z.string({ required_error: 'Subject is required' }).min(1, 'Subject is required'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be between 10 and 1000 characters long')
    .max(1000, 'Message must be between 10 and 1000 characters long'),
  recaptchaToken: z.string().optional().nullable()
});
