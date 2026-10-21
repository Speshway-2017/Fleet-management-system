import { z } from 'zod';
import { emailSchema, optionalPhoneSchema } from './common.schema.js';

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
    .refine((val) => !/\d/.test(val), { message: 'Numbers are not allowed in full name' })
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Special characters are not allowed in full name' }),
  email: emailSchema,
  phone: optionalPhoneSchema,
  company: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(1, 'Company name is required')
    .min(2, 'Company name must be between 2 and 30 characters long')
    .max(30, 'Company name must be between 2 and 30 characters long')
    .refine((val) => !/\d/.test(val), { message: 'Numbers are not allowed in company name' })
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Special characters are not allowed in company name' }),
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(1, 'Subject is required'),
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
  recaptchaToken: z.string().optional().nullable()
});



