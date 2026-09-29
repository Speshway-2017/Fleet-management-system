import { z } from 'zod';
import {
  emailSchema,
  phoneSchema,
  optionalPhoneSchema,
  personNameSchema,
  ipAllowlistSchema,
  optionalUrlSchema
} from './common.schema.js';

export const updateGeneralSettingsSchema = z.object({
  platformName: z
    .string({ required_error: 'Platform name is required.' })
    .trim()
    .min(1, 'Platform name is required.')
    .min(2, 'Platform name must be at least 2 characters.')
    .max(30, 'Platform name must not exceed 30 characters.')
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Platform name must contain alphabets only.' }),
  timezone: z
    .string({ required_error: 'Timezone is required.' })
    .trim()
    .min(1, 'Timezone is required.'),
  language: z
    .string({ required_error: 'Language is required.' })
    .trim()
    .min(1, 'Language is required.'),
  footerDescription: z
    .string({ required_error: 'Footer description is required.' })
    .trim()
    .min(1, 'Footer description is required.')
    .min(10, 'Footer description must be at least 10 characters.')
    .max(500, 'Footer description must not exceed 500 characters.'),
  contactPhone: phoneSchema,
  contactEmail: emailSchema,
  contactAddress: z
    .string({ required_error: 'HQ / Contact address is required.' })
    .trim()
    .min(1, 'HQ / Contact address is required.')
    .min(5, 'HQ / Contact address must be at least 5 characters.')
    .max(100, 'HQ / Contact address must not exceed 100 characters.'),
  facebookUrl: optionalUrlSchema('Facebook URL'),
  linkedinUrl: optionalUrlSchema('LinkedIn URL'),
  twitterUrl: optionalUrlSchema('Twitter URL'),
  youtubeUrl: optionalUrlSchema('YouTube URL')
}).passthrough();

export const adminProfileSchema = z.object({
  firstName: personNameSchema,
  lastName: z
    .string()
    .trim()
    .max(20, 'Last name must not exceed 20 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Last name must contain alphabets only.' })
    .optional(),
  email: emailSchema,
  phone: optionalPhoneSchema,
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional()
}).refine((data) => {
  if (data.newPassword || data.confirmNewPassword) {
    if (!data.currentPassword) return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password.',
  path: ['currentPassword']
}).refine((data) => {
  if (data.currentPassword && !data.newPassword) {
    return false;
  }
  return true;
}, {
  message: 'New password is required.',
  path: ['newPassword']
}).refine((data) => {
  if (data.newPassword) {
    if (data.newPassword.length < 6) return false;
    if (!/[A-Z]/.test(data.newPassword)) return false;
    if (!/[0-9]/.test(data.newPassword)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword)) return false;
  }
  return true;
}, {
  message: 'Password must be at least 6 characters with 1 uppercase, 1 number, and 1 special character.',
  path: ['newPassword']
}).refine((data) => {
  if (data.newPassword && data.confirmNewPassword !== data.newPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match.',
  path: ['confirmNewPassword']
});

export const blogSchema = z.object({
  title: z
    .string({ required_error: 'Title is required.' })
    .trim()
    .min(1, 'Title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title must not exceed 100 characters.')
    .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Title must contain alphabets only (numbers & symbols are not allowed).' }),
  category: z
    .enum(['Operations', 'Security', 'Technology', 'Compliance', 'Business'], {
      errorMap: () => ({ message: 'Please select a valid category.' })
    }),
  readTime: z
    .string({ required_error: 'Read time is required.' })
    .trim()
    .min(1, 'Read time is required.')
    .min(2, 'Read time must be at least 2 characters.')
    .max(20, 'Read time must not exceed 20 characters.'),
  image: z
    .string({ required_error: 'Banner image URL is required.' })
    .trim()
    .min(1, 'Banner image URL is required.')
    .max(300, 'Image URL must not exceed 300 characters.')
    .refine((val) => {
      try {
        const url = new URL(val);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, { message: 'Please enter a valid image URL (e.g. https://images.unsplash.com/...).' }),
  summary: z
    .string({ required_error: 'Short summary is required.' })
    .trim()
    .min(1, 'Short summary is required.')
    .min(10, 'Summary must be at least 10 characters.')
    .max(250, 'Summary must not exceed 250 characters.'),
  content: z.union([
    z.string().trim().min(20, 'Article content must be at least 20 characters.').max(5000, 'Article content must not exceed 5000 characters.'),
    z.array(z.string().trim()).min(1, 'Article content must contain at least one paragraph.')
  ])
});

export const timelineItemSchema = z.object({
  year: z
    .string({ required_error: 'Year is required.' })
    .trim()
    .min(1, 'Year is required.')
    .min(2, 'Year must be at least 2 characters.')
    .max(10, 'Year must not exceed 10 characters.'),
  text: z
    .string({ required_error: 'Milestone description is required.' })
    .trim()
    .min(1, 'Milestone description is required.')
    .min(5, 'Milestone description must be at least 5 characters.')
    .max(200, 'Milestone description must not exceed 200 characters.')
});

export const aboutSchema = z.object({
  storyTitle: z
    .string({ required_error: 'Story title is required.' })
    .trim()
    .min(1, 'Story title is required.')
    .min(3, 'Story title must be at least 3 characters.')
    .max(100, 'Story title must not exceed 100 characters.'),
  storyContentText: z
    .string({ required_error: 'Story content is required.' })
    .trim()
    .min(1, 'Story content is required.')
    .min(20, 'Story content must be at least 20 characters.')
    .max(3000, 'Story content must not exceed 3000 characters.')
    .optional(),
  storyContent: z.union([
    z.string().trim().min(20, 'Story content must be at least 20 characters.').max(3000, 'Story content must not exceed 3000 characters.'),
    z.array(z.string().trim()).min(1, 'Story content is required.')
  ]).optional(),
  missionTitle: z
    .string({ required_error: 'Mission title is required.' })
    .trim()
    .min(1, 'Mission title is required.')
    .min(3, 'Mission title must be at least 3 characters.')
    .max(100, 'Mission title must not exceed 100 characters.'),
  missionContentText: z
    .string({ required_error: 'Mission content is required.' })
    .trim()
    .min(1, 'Mission content is required.')
    .min(20, 'Mission content must be at least 20 characters.')
    .max(3000, 'Mission content must not exceed 3000 characters.')
    .optional(),
  missionContent: z.union([
    z.string().trim().min(20, 'Mission content must be at least 20 characters.').max(3000, 'Mission content must not exceed 3000 characters.'),
    z.array(z.string().trim()).min(1, 'Mission content is required.')
  ]).optional(),
  missionQuote: z
    .string({ required_error: 'Mission quote is required.' })
    .trim()
    .min(1, 'Mission quote is required.')
    .min(5, 'Mission quote must be at least 5 characters.')
    .max(200, 'Mission quote must not exceed 200 characters.'),
  statsFounded: z
    .string({ required_error: 'Year founded is required.' })
    .trim()
    .min(1, 'Year founded is required.')
    .min(4, 'Year must be 4 digits.')
    .max(4, 'Year must be 4 digits.')
    .refine((val) => /^\d{4}$/.test(val), { message: 'Year must contain 4 digits (e.g. 2018).' }),
  statsEnterprises: z
    .string({ required_error: 'Enterprises count is required.' })
    .trim()
    .min(1, 'Enterprises count is required.')
    .max(10, 'Enterprises count must not exceed 10 characters.'),
  statsVehicles: z
    .string({ required_error: 'Vehicles count is required.' })
    .trim()
    .min(1, 'Vehicles count is required.')
    .max(10, 'Vehicles count must not exceed 10 characters.'),
  statsSavings: z
    .string({ required_error: 'Customer savings is required.' })
    .trim()
    .min(1, 'Customer savings is required.')
    .max(10, 'Customer savings must not exceed 10 characters.'),
  timeline: z.array(timelineItemSchema).optional()
});

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
  sessionTimeout: z.union([z.number(), z.string().trim()]).optional(),
  maxLoginAttempts: z
    .union([
      z.number({ required_error: 'Allowed attempts is required.' })
        .min(1, 'Allowed attempts must be between 1 and 10.')
        .max(10, 'Allowed attempts must be between 1 and 10.'),
      z.string({ required_error: 'Allowed attempts is required.' })
        .trim()
        .min(1, 'Allowed attempts is required.')
        .refine(val => /^\d+$/.test(val), { message: 'Allowed attempts must contain numbers only.' })
        .refine(val => {
          const num = Number(val);
          return num >= 1 && num <= 10;
        }, { message: 'Allowed attempts must be between 1 and 10.' })
    ]),
  passwordPolicy: z.object({
    requireUppercase: z.boolean().optional(),
    requireNumber: z.boolean().optional(),
    requireSpecial: z.boolean().optional()
  }).optional(),
  ipAllowlistEnabled: z.boolean().optional(),
  allowedIps: ipAllowlistSchema.optional()
}).passthrough();

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  primaryEmailAddress: z
    .string({ required_error: 'Primary email address is required.' })
    .trim()
    .min(1, 'Primary email address is required.')
    .min(5, 'Primary email address must be at least 5 characters.')
    .max(50, 'Primary email address must not exceed 50 characters.')
    .refine((val) => !/\s/.test(val), { message: 'Primary email address must not contain spaces.' })
    .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid primary email address.'
    }),
  systemAlerts: z.boolean().optional(),
  systemAlertsSeverity: z.string().optional(),
  maintenanceAlerts: z.boolean().optional(),
  maintenanceAlert48h: z.boolean().optional(),
  maintenanceAlert1h: z.boolean().optional(),
  inviteNotifications: z.boolean().optional(),
  inviteSent: z.boolean().optional(),
  inviteAccepted: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
  weeklyReportDay: z.string().optional(),
  newOrganizationAlerts: z.boolean().optional(),
  requireAdminReview: z.boolean().optional()
}).passthrough();

