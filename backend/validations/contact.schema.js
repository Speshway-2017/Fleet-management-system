import { z } from 'zod';
import { emailSchema } from './common.schema.js';

export const validateMessageContent = (val) => {
  if (!val || typeof val !== 'string') return 'Message is required';
  const trimmed = val.trim();
  if (!trimmed) return 'Message is required';
  if (trimmed.length < 10 || val.length > 500) {
    return 'Message must be between 10 and 500 characters long';
  }
  if (!/^[\p{L}\p{N}\s\p{P}\p{S}]+$/u.test(val)) {
    return 'Message can only contain letters, numbers, spaces, and normal punctuation';
  }
  const noSpace = trimmed.replace(/\s+/g, '');
  if (/^\d+$/.test(noSpace)) {
    return 'Message cannot contain only numbers';
  }
  if (/^[^\p{L}\p{N}]+$/u.test(noSpace)) {
    return 'Message cannot contain only symbols';
  }
  if (!/\p{L}/u.test(trimmed)) {
    return 'Message must contain letters and cannot be only numbers or symbols';
  }
  if (/(.)\1{4,}/u.test(trimmed)) {
    return 'Message cannot contain excessive repeated characters';
  }
  if (/([\p{L}\p{N}]{2,6})\1{3,}/u.test(noSpace)) {
    return 'Message cannot contain repetitive character patterns';
  }
  const meaningfulChars = trimmed.replace(/[^\p{L}\p{N}]/gu, '');
  if (meaningfulChars.length < 10) {
    return 'Message must contain at least 10 meaningful characters';
  }
  if (new Set(meaningfulChars.toLowerCase()).size < 3) {
    return 'Please enter a meaningful message';
  }
  return '';
};

export const contactRequestSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be between 2 and 30 characters long')
    .max(30, 'Full name must be between 2 and 30 characters long')
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
    .refine((val) => !val || (val.length >= 2 && val.length <= 30), {
      message: 'Company name must be between 2 and 30 characters long'
    })
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
    .min(10, 'Message must be between 10 and 500 characters long')
    .max(500, 'Message must be between 10 and 500 characters long')
    .superRefine((val, ctx) => {
      const err = validateMessageContent(val);
      if (err && err !== 'Message is required' && !err.includes('between 10 and 500')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err
        });
      }
    }),
  captchaToken: z.string().optional().nullable(),
  recaptchaToken: z.string().optional().nullable()
}).passthrough();


