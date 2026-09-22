import { z } from 'zod';
import { emailSchema, optionalPhoneSchema, ipAllowlistSchema } from './common.schema.js';

export const supportSettingsSchema = z.object({
  supportPhone: optionalPhoneSchema,
  supportEmail: emailSchema.optional().nullable(),
  whatsappNumber: optionalPhoneSchema,
  emergencyDispatch: optionalPhoneSchema,
  operatingHours: z.string().trim().optional(),
  helpCenterUrl: z.string().trim().optional()
});

export const securitySettingsSchema = z.object({
  twoFactorAdmin: z.boolean().optional(),
  twoFactorManager: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  maxLoginAttempts: z.number().optional(),
  passwordPolicy: z.object({
    requireUppercase: z.boolean().optional(),
    requireNumber: z.boolean().optional(),
    requireSpecial: z.boolean().optional()
  }).optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  allowedIps: ipAllowlistSchema.optional()
});

