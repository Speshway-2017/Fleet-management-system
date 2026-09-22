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


export const changePasswordSchema = z.object({
  oldPassword: z.string({ required_error: 'Old password is required' }).min(1, 'Old password is required'),
  newPassword: passwordSchema
});

export const registerAdminSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  password: passwordSchema
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string({ required_error: 'OTP is required' }).trim().min(1, 'OTP is required')
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string({ required_error: 'OTP is required' }).trim().min(1, 'OTP is required'),
  newPassword: passwordSchema
});

export const profileUpdateSchema = z.object({
  name: personNameSchema.optional(),
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  currentPassword: z.string().optional(),
  newPassword: passwordSchema.optional()
});

export const managerProfileSchema = z.object({
  name: personNameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  jobTitle: z.string().trim().max(50).optional(),
  primaryHub: z.string().trim().max(50).optional()
});

