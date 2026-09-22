import { z } from 'zod';

/**
 * Frontend Reusable Field Schemas
 */

// Email: max 30 chars, valid RFC email, no whitespace
export const emailSchema = z
  .string({ required_error: 'Email address is required.' })
  .trim()
  .min(1, 'Email address is required.')
  .max(30, 'Email address must not exceed 30 characters.')
  .refine((val) => !/\s/.test(val), { message: 'Email address must not contain spaces.' })
  .refine((val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
    message: 'Please enter a valid email address.'
  });

export const optionalEmailSchema = z
  .string()
  .trim()
  .max(30, 'Email address must not exceed 30 characters.')
  .refine((val) => !val || !/\s/.test(val), { message: 'Email address must not contain spaces.' })
  .refine((val) => !val || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val), {
    message: 'Please enter a valid email address.'
  })
  .optional()
  .nullable();

// Phone Number: exact 10 numeric digits, no alphabets/symbols
export const phoneSchema = z
  .string({ required_error: 'Phone number is required.' })
  .trim()
  .min(1, 'Phone number is required.')
  .refine((val) => /^\d+$/.test(val), { message: 'Phone number must contain numbers only.' })
  .refine((val) => val.length === 10, { message: 'Phone number must be exactly 10 digits.' });

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((val) => !val || /^\d+$/.test(val), { message: 'Phone number must contain numbers only.' })
  .refine((val) => !val || val.length === 10, { message: 'Phone number must be exactly 10 digits.' })
  .optional()
  .nullable();

// Organization Name: max 20 chars, alphabets and spaces only
export const orgNameSchema = z
  .string({ required_error: 'Organization Name is required.' })
  .trim()
  .min(1, 'Organization Name is required.')
  .max(20, 'Organization name must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Organization name must contain alphabets only.' });

// Industry: max 20 chars, alphabets and spaces only
export const industrySchema = z
  .string({ required_error: 'Industry is required.' })
  .trim()
  .min(1, 'Industry is required.')
  .max(20, 'Industry must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Industry must contain alphabets only.' });

// Person Full Name: max 50 chars, alphabets and spaces only
export const personNameSchema = z
  .string({ required_error: 'Full name is required.' })
  .trim()
  .min(1, 'Full name is required.')
  .max(50, 'Full name must not exceed 50 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Full name must contain alphabets only.' });

// Manager Name: max 20 chars, alphabets and spaces only
export const managerNameSchema = z
  .string({ required_error: 'Manager Name is required.' })
  .trim()
  .min(1, 'Manager Name is required.')
  .max(20, 'Manager name must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Manager name must contain alphabets only.' });

// Street Address: max 100 chars
export const streetAddressSchema = z
  .string()
  .trim()
  .max(100, 'Street address must not exceed 100 characters.')
  .optional()
  .nullable();

// City: max 20 chars, alphabets and spaces only
export const citySchema = z
  .string()
  .trim()
  .max(20, 'City must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'City must contain alphabets only.' })
  .optional()
  .nullable();

// State: max 20 chars, alphabets and spaces only
export const stateSchema = z
  .string()
  .trim()
  .max(20, 'State must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'State must contain alphabets only.' })
  .optional()
  .nullable();

// Country: max 20 chars, alphabets and spaces only
export const countrySchema = z
  .string()
  .trim()
  .max(20, 'Country must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Country must contain alphabets only.' })
  .optional()
  .nullable();

// Plan Name: max 50 chars, text-only (no digits)
export const planNameSchema = z
  .string({ required_error: 'Plan name is required.' })
  .trim()
  .min(1, 'Plan name is required.')
  .max(50, 'Plan name must not exceed 50 characters.')
  .refine((val) => !/\d/.test(val), { message: 'Plan name must not contain numbers.' });

// Plan Description: max 100 chars, text-only (no digits)
export const planDescriptionSchema = z
  .string({ required_error: 'Description is required.' })
  .trim()
  .min(1, 'Description is required.')
  .max(100, 'Description must not exceed 100 characters.')
  .refine((val) => !/\d/.test(val), { message: 'Description must not contain numbers.' });

// Integer counts (e.g. Drivers, Vehicles, Trips)
export const integerCountSchema = (fieldName = 'Value') =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }, z.number({ invalid_type_error: `${fieldName} must be a valid number.` })
    .int(`${fieldName} must be a whole number (no decimals).`)
    .min(0, `${fieldName} cannot be negative.`));

// Decimal/Numeric amount
export const numericAmountSchema = (fieldName = 'Amount') =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    const num = Number(val);
    return isNaN(num) ? val : num;
  }, z.number({ invalid_type_error: `${fieldName} must be a valid number.` })
    .min(0, `${fieldName} cannot be negative.`));

// Password
export const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(6, 'Password must be at least 6 characters long.');

// IPv4 Helper and Schemas
export const isValidIpv4 = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d+$/.test(part)) return false;
    if (part.length > 1 && part.startsWith('0')) return false;
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
};

export const ipv4Schema = z
  .string({ required_error: 'Invalid Parameter', invalid_type_error: 'Invalid Parameter' })
  .trim()
  .refine(
    (value) => {
      if (!value) return true;
      return isValidIpv4(value);
    },
    { message: 'Invalid Parameter' }
  );

export const ipAllowlistSchema = z
  .string()
  .refine(
    (value) => {
      if (!value || !value.trim()) return true;
      const rawIps = value.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean);
      if (rawIps.length === 0) return true;
      return rawIps.every((ip) => isValidIpv4(ip));
    },
    { message: 'Invalid Parameter' }
  );
