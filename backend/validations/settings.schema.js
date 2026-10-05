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

export const updateSettingsSchema = updateGeneralSettingsSchema;

export const adminProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  firstName: personNameSchema.optional(),
  lastName: z
    .string()
    .trim()
    .max(20, 'Last name must not exceed 20 characters.')
    .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Last name must contain alphabets only.' })
    .optional(),
  email: emailSchema.optional(),
  phone: optionalPhoneSchema,
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional()
}).passthrough();

export const blogSchema = z.object({
  title: z
    .string({ required_error: 'Title is required.' })
    .trim()
    .min(1, 'Title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(100, 'Title must not exceed 100 characters.')
    .refine((val) => /^[a-zA-Z\s,.'\-&!?:;]+$/.test(val), { message: 'Title must contain alphabets only (numbers are not allowed).' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Title must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,4})\1{2,}/i.test(val.replace(/[\s,.'\-&!?:;]+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 2, { message: 'Please enter meaningful content.' }),
  category: z
    .enum(['Operations', 'Security', 'Technology', 'Compliance', 'Business'], {
      errorMap: () => ({ message: 'Please select a valid category.' })
    }),
  readTime: z
    .string({ required_error: 'Read time is required.' })
    .trim()
    .min(1, 'Read time is required.')
    .min(2, 'Read time must be at least 2 characters.')
    .max(20, 'Read time must not exceed 20 characters.')
    .refine((val) => /\d/.test(val), { message: 'Please enter a valid read time (e.g. 5 min read).' })
    .refine((val) => /^[a-zA-Z0-9\s\-–.]+$/.test(val), { message: 'Please enter a valid read time (e.g. 5 min read).' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
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
    .max(250, 'Summary must not exceed 250 characters.')
    .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Summary cannot contain numbers only.' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Summary must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' }),
  content: z.union([
    z
      .string()
      .trim()
      .min(1, 'Article content is required.')
      .min(20, 'Article content must be at least 20 characters.')
      .max(5000, 'Article content must not exceed 5000 characters.')
      .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Article content cannot contain numbers only.' })
      .refine((val) => /[a-zA-Z]/.test(val), { message: 'Article content must contain alphabetic characters.' })
      .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
      .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
      .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 4, { message: 'Please enter meaningful content.' }),
    z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Paragraph cannot be empty.')
          .min(10, 'Paragraph must be at least 10 characters.')
          .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Article paragraph cannot contain numbers only.' })
          .refine((val) => /[a-zA-Z]/.test(val), { message: 'Article paragraph must contain alphabetic characters.' })
          .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
          .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' })
      )
      .min(1, 'Article content must contain at least one paragraph.')
  ]),
  date: z.string().optional()
}).passthrough();

export const timelineItemSchema = z.object({
  year: z
    .string({ required_error: 'Year is required.' })
    .trim()
    .min(1, 'Year is required.')
    .min(2, 'Year must be at least 2 characters.')
    .max(10, 'Year must not exceed 10 characters.')
    .refine((val) => /\d{2,}/.test(val), { message: 'Please enter a valid milestone year (e.g. 2026).' })
    .refine((val) => /^[0-9\s\-/Q]+$/i.test(val), { message: 'Please enter a valid milestone year (e.g. 2026).' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  text: z
    .string({ required_error: 'Milestone description is required.' })
    .trim()
    .min(1, 'Milestone description is required.')
    .min(5, 'Milestone description must be at least 5 characters.')
    .max(200, 'Milestone description must not exceed 200 characters.')
    .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Milestone description cannot contain numbers only.' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Milestone description must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,5})\1{2,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' })
});

export const aboutSchema = z.object({
  storyTitle: z
    .string({ required_error: 'Story title is required.' })
    .trim()
    .min(1, 'Story title is required.')
    .min(3, 'Story title must be at least 3 characters.')
    .max(100, 'Story title must not exceed 100 characters.')
    .refine((val) => /^[a-zA-Z\s,.'\-&!?:;]+$/.test(val), { message: 'Story title must contain alphabets only (numbers are not allowed).' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Story title must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,4})\1{2,}/i.test(val.replace(/[\s,.'\-&!?:;]+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 2, { message: 'Please enter meaningful content.' }),
  storyContentText: z
    .string()
    .trim()
    .min(1, 'Story content is required.')
    .min(20, 'Story content must be at least 20 characters.')
    .max(3000, 'Story content must not exceed 3000 characters.')
    .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Story content cannot contain numbers only.' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Story content must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 4, { message: 'Please enter meaningful content.' })
    .optional(),
  storyContent: z.union([
    z
      .string()
      .trim()
      .min(1, 'Story content is required.')
      .min(20, 'Story content must be at least 20 characters.')
      .max(3000, 'Story content must not exceed 3000 characters.')
      .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Story content cannot contain numbers only.' })
      .refine((val) => /[a-zA-Z]/.test(val), { message: 'Story content must contain alphabetic characters.' })
      .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
      .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
      .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 4, { message: 'Please enter meaningful content.' }),
    z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Paragraph cannot be empty.')
          .min(10, 'Paragraph must be at least 10 characters.')
          .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Story paragraph cannot contain numbers only.' })
          .refine((val) => /[a-zA-Z]/.test(val), { message: 'Story paragraph must contain alphabetic characters.' })
          .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
          .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' })
      )
      .min(1, 'Story content is required.')
  ]),
  missionTitle: z
    .string({ required_error: 'Mission title is required.' })
    .trim()
    .min(1, 'Mission title is required.')
    .min(3, 'Mission title must be at least 3 characters.')
    .max(100, 'Mission title must not exceed 100 characters.')
    .refine((val) => /^[a-zA-Z\s,.'\-&!?:;]+$/.test(val), { message: 'Mission title must contain alphabets only (numbers are not allowed).' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Mission title must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,4})\1{2,}/i.test(val.replace(/[\s,.'\-&!?:;]+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 2, { message: 'Please enter meaningful content.' }),
  missionContentText: z
    .string()
    .trim()
    .min(1, 'Mission content is required.')
    .min(20, 'Mission content must be at least 20 characters.')
    .max(3000, 'Mission content must not exceed 3000 characters.')
    .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Mission content cannot contain numbers only.' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Mission content must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 4, { message: 'Please enter meaningful content.' })
    .optional(),
  missionContent: z.union([
    z
      .string()
      .trim()
      .min(1, 'Mission content is required.')
      .min(20, 'Mission content must be at least 20 characters.')
      .max(3000, 'Mission content must not exceed 3000 characters.')
      .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Mission content cannot contain numbers only.' })
      .refine((val) => /[a-zA-Z]/.test(val), { message: 'Mission content must contain alphabetic characters.' })
      .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
      .refine((val) => !/([a-zA-Z]{2,6})\1{3,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
      .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 4, { message: 'Please enter meaningful content.' }),
    z
      .array(
        z
          .string()
          .trim()
          .min(1, 'Paragraph cannot be empty.')
          .min(10, 'Paragraph must be at least 10 characters.')
          .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Mission paragraph cannot contain numbers only.' })
          .refine((val) => /[a-zA-Z]/.test(val), { message: 'Mission paragraph must contain alphabetic characters.' })
          .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' })
          .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' })
      )
      .min(1, 'Mission content is required.')
  ]),
  missionQuote: z
    .string({ required_error: 'Mission quote is required.' })
    .trim()
    .min(1, 'Mission quote is required.')
    .min(5, 'Mission quote must be at least 5 characters.')
    .max(200, 'Mission quote must not exceed 200 characters.')
    .refine((val) => !/^[0-9\s.,!?'"()\-–—]+$/.test(val), { message: 'Mission quote cannot contain numbers only.' })
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Mission quote must contain alphabetic characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' })
    .refine((val) => !/([a-zA-Z]{2,5})\1{2,}/i.test(val.replace(/\s+/g, '')), { message: 'Repeated characters are not allowed.' })
    .refine((val) => new Set(val.replace(/[^a-zA-Z]/g, '').toLowerCase()).size >= 3, { message: 'Please enter meaningful content.' }),
  statsFounded: z
    .string({ required_error: 'Year founded is required.' })
    .trim()
    .min(1, 'Year founded is required.')
    .refine((val) => /^\d{4}$/.test(val), { message: 'Year must contain 4 digits (e.g. 2018).' })
    .refine((val) => {
      const yr = parseInt(val, 10);
      return yr >= 1900 && yr <= 2099;
    }, { message: 'Please enter a valid year between 1900 and 2099.' }),
  statsEnterprises: z
    .string({ required_error: 'Enterprises count is required.' })
    .trim()
    .min(1, 'Enterprises count is required.')
    .max(10, 'Enterprises count must not exceed 10 characters.')
    .refine((val) => /\d/.test(val), { message: 'Please enter a valid enterprises count (e.g. 340+, 10K+).' })
    .refine((val) => /^[0-9+kKmMbB,.\s]+$/.test(val), { message: 'Please enter a valid enterprises count (e.g. 340+, 10K+).' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  statsVehicles: z
    .string({ required_error: 'Vehicles count is required.' })
    .trim()
    .min(1, 'Vehicles count is required.')
    .max(10, 'Vehicles count must not exceed 10 characters.')
    .refine((val) => /\d/.test(val), { message: 'Please enter a valid vehicles count (e.g. 1.2M+, 500+).' })
    .refine((val) => /^[0-9+kKmMbB,.\s]+$/.test(val), { message: 'Please enter a valid vehicles count (e.g. 1.2M+, 500+).' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  statsSavings: z
    .string({ required_error: 'Customer savings is required.' })
    .trim()
    .min(1, 'Customer savings is required.')
    .max(10, 'Customer savings must not exceed 10 characters.')
    .refine((val) => /\d/.test(val), { message: 'Please enter a valid customer savings amount (e.g. $180M+, ₹50Cr+).' })
    .refine((val) => /^[0-9$₹€£+kKmMbBcCrr,.\s%]+$/.test(val), { message: 'Please enter a valid customer savings amount (e.g. $180M+, ₹50Cr+).' })
    .refine((val) => !/(.)\1{4,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  timeline: z.array(timelineItemSchema).optional()
}).passthrough();

export const updateSupportSettingsSchema = z.object({
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

export const driverSupportSettingsSchema = z.object({
  officeName: z
    .string({ required_error: 'Office / Hub Title is required.' })
    .trim()
    .min(1, 'Office / Hub Title is required.')
    .min(2, 'Office / Hub Title must be at least 2 characters.')
    .max(50, 'Office / Hub Title must not exceed 50 characters.')
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Office / Hub Title must contain letters.' })
    .refine((val) => /^[a-zA-Z0-9\s,.'\-&/]+$/.test(val), { message: 'Office / Hub Title contains invalid characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  phone: z
    .string({ required_error: 'Manager phone number is required.' })
    .trim()
    .min(1, 'Manager phone number is required.')
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return clean.length === 10;
    }, { message: 'Phone number must contain exactly 10 digits.' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return /^[1-9]/.test(clean);
    }, { message: 'Phone number must start with 1-9 (cannot start with 0).' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return !/^(\d)\1{9}$/.test(clean);
    }, { message: 'Please enter a valid active phone number.' }),
  whatsappNumber: z
    .string({ required_error: 'WhatsApp support number is required.' })
    .trim()
    .min(1, 'WhatsApp support number is required.')
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return clean.length === 10;
    }, { message: 'WhatsApp number must contain exactly 10 digits.' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return /^[1-9]/.test(clean);
    }, { message: 'WhatsApp number must start with 1-9 (cannot start with 0).' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return !/^(\d)\1{9}$/.test(clean);
    }, { message: 'Please enter a valid active WhatsApp number.' }),
  email: z
    .string({ required_error: 'Manager office email is required.' })
    .trim()
    .min(1, 'Manager office email is required.')
    .max(80, 'Email must not exceed 80 characters.')
    .refine((val) => !/\s/.test(val), { message: 'Email address must not contain spaces.' })
    .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid email address.'
    }),
  dispatchName: z
    .string({ required_error: 'Dispatch Desk Title is required.' })
    .trim()
    .min(1, 'Dispatch Desk Title is required.')
    .min(2, 'Dispatch Desk Title must be at least 2 characters.')
    .max(50, 'Dispatch Desk Title must not exceed 50 characters.')
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Dispatch Desk Title must contain letters.' })
    .refine((val) => /^[a-zA-Z0-9\s,.'\-&/]+$/.test(val), { message: 'Dispatch Desk Title contains invalid characters.' })
    .refine((val) => !/(.)\1{3,}/i.test(val), { message: 'Repeated characters are not allowed.' }),
  dispatchPhone: z
    .string({ required_error: 'Emergency dispatch phone number is required.' })
    .trim()
    .min(1, 'Emergency dispatch phone number is required.')
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return clean.length === 10;
    }, { message: 'Emergency phone number must contain exactly 10 digits.' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return /^[1-9]/.test(clean);
    }, { message: 'Emergency phone number must start with 1-9 (cannot start with 0).' })
    .refine((val) => {
      const clean = val.replace(/^(\+91|91|0)/, '').replace(/\D/g, '');
      return !/^(\d)\1{9}$/.test(clean);
    }, { message: 'Please enter a valid active phone number.' }),
  dispatchEmail: z
    .string({ required_error: 'Dispatch desk email is required.' })
    .trim()
    .min(1, 'Dispatch desk email is required.')
    .max(80, 'Email must not exceed 80 characters.')
    .refine((val) => !/\s/.test(val), { message: 'Email address must not contain spaces.' })
    .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
      message: 'Please enter a valid email address.'
    }),
}).passthrough();


