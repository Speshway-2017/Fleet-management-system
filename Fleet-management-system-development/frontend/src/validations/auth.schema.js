import { z } from 'zod';
import { emailSchema, passwordSchema, personNameSchema, optionalPhoneSchema } from './common.schema.js';

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required')
});

export const driverLoginSchema = z.object({
  identifier: z.string({ required_error: 'Please enter email, phone number, or employee ID.' }).trim().min(1, 'Please enter email, phone number, or employee ID.'),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.')
});


export const forgotPasswordSchema = z.object({
  contact: z.string({ required_error: 'Please enter registered email or phone number.' }).trim().min(1, 'Please enter registered email or phone number.')
});

export const otpSchema = z.object({
  otp: z.string({ required_error: 'OTP is required' }).trim().length(6, 'OTP must be 6 digits')
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string({ required_error: 'Confirm password is required' }).min(1, 'Confirm password is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: 'Current password is required.' })
      .trim()
      .min(1, 'Current password is required.')
      .max(20, 'Current password must not exceed 20 characters.'),
    newPassword: z
      .string({ required_error: 'New password is required.' })
      .trim()
      .min(1, 'New password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .max(20, 'Password must not exceed 20 characters.')
      .refine((val) => !/\s/.test(val), { message: 'Password must not contain spaces.' })
      .refine((val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val), {
        message: 'Password must contain uppercase, lowercase and number.'
      }),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required.' })
      .trim()
      .min(1, 'Confirm password is required.')
      .max(20, 'Confirm password must not exceed 20 characters.')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  })
  .refine((data) => !data.currentPassword || data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword']
  });

export const profileUpdateSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required.' })
    .trim()
    .min(1, 'First name is required.')
    .max(20, 'First name must not exceed 20 characters.')
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'First name must contain alphabets only.' }),
  lastName: z
    .string()
    .trim()
    .max(20, 'Last name must not exceed 20 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Last name must contain alphabets only.' })
    .optional(),
  email: emailSchema,
  phone: optionalPhoneSchema
});

export const managerProfileSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required.' })
    .trim()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.')
    .max(50, 'Full name must not exceed 50 characters.')
    .refine((val) => /^[a-zA-Z\s.'-]+$/.test(val), { message: 'Full name contains invalid characters.' })
    .refine((val) => !/\d/.test(val), { message: 'Full name must contain letters only (numbers are not allowed).' }),
  email: emailSchema,
  phone: optionalPhoneSchema,
  jobTitle: z.string().trim().max(50).optional().nullable(),
  primaryHub: z.string().trim().max(100).optional().nullable()
});

