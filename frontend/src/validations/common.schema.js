import { z } from 'zod';

/**
 * Frontend Reusable Field Schemas
 */

// Email: min 5, max 30 chars, valid RFC email, no whitespace
export const emailSchema = z
  .string({ required_error: 'Email address is required.' })
  .trim()
  .min(1, 'Email address is required.')
  .min(5, 'Email address must be at least 5 characters.')
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

// Organization Name: min 2, max 20 chars, alphabets and spaces only
export const orgNameSchema = z
  .string({ required_error: 'Organization Name is required.' })
  .trim()
  .min(1, 'Organization Name is required.')
  .min(2, 'Organization name must be at least 2 characters.')
  .max(20, 'Organization name must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Organization name must contain alphabets only.' });

// Industry: min 2, max 20 chars, alphabets and spaces only
export const industrySchema = z
  .string({ required_error: 'Industry is required.' })
  .trim()
  .min(1, 'Industry is required.')
  .min(2, 'Industry must be at least 2 characters.')
  .max(20, 'Industry must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Industry must contain alphabets only.' });

// Person Full Name: min 2, max 20 chars, alphabets and spaces only
export const personNameSchema = z
  .string({ required_error: 'Full name is required.' })
  .trim()
  .min(1, 'Full name is required.')
  .min(2, 'Full name must be at least 2 characters.')
  .max(20, 'Full name must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Full name must contain alphabets only.' });

// Manager Name: min 2, max 20 chars, alphabets and spaces only
export const managerNameSchema = z
  .string({ required_error: 'Full name is required.' })
  .trim()
  .min(1, 'Full name is required.')
  .min(2, 'Full name must be at least 2 characters.')
  .max(20, 'Full name must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Full name must contain alphabets only.' });

// Street Address: min 5, max 30 chars, required
export const streetAddressSchema = z
  .string({ required_error: 'Street address is required.' })
  .trim()
  .min(1, 'Street address is required.')
  .min(5, 'Street address must be at least 5 characters.')
  .max(30, 'Street address must not exceed 30 characters.');

// City: min 2, max 20 chars, alphabets and spaces only, required
export const citySchema = z
  .string({ required_error: 'City is required.' })
  .trim()
  .min(1, 'City is required.')
  .min(2, 'City must be at least 2 characters.')
  .max(20, 'City must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'City must contain alphabets only.' });

// State: min 2, max 20 chars, alphabets and spaces only, required
export const stateSchema = z
  .string({ required_error: 'State is required.' })
  .trim()
  .min(1, 'State is required.')
  .min(2, 'State must be at least 2 characters.')
  .max(20, 'State must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'State must contain alphabets only.' });

// Country: min 2, max 20 chars, alphabets and spaces only, required
export const countrySchema = z
  .string({ required_error: 'Country is required.' })
  .trim()
  .min(1, 'Country is required.')
  .min(2, 'Country must be at least 2 characters.')
  .max(20, 'Country must not exceed 20 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Country must contain alphabets only.' });

// Optional address helpers for partial updates
export const optionalStreetAddressSchema = z
  .string()
  .trim()
  .max(30, 'Street address must not exceed 30 characters.')
  .optional()
  .nullable();

export const optionalCitySchema = z
  .string()
  .trim()
  .max(20, 'City must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'City must contain alphabets only.' })
  .optional()
  .nullable();

export const optionalStateSchema = z
  .string()
  .trim()
  .max(20, 'State must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'State must contain alphabets only.' })
  .optional()
  .nullable();

export const optionalCountrySchema = z
  .string()
  .trim()
  .max(20, 'Country must not exceed 20 characters.')
  .refine((val) => !val || /^[a-zA-Z\s]+$/.test(val), { message: 'Country must contain alphabets only.' })
  .optional()
  .nullable();

// Plan Name: min 2 chars, max 50 chars, alphabets only
export const planNameSchema = z
  .string({ required_error: 'Plan name is required.' })
  .trim()
  .min(2, 'Plan name must be at least 2 characters.')
  .max(50, 'Plan name must not exceed 50 characters.')
  .refine((val) => /^[a-zA-Z\s]+$/.test(val), { message: 'Plan name must contain alphabets only (numbers & symbols are not allowed).' });

// Plan Description: min 5 chars, max 100 chars, text-only (no digits)
export const planDescriptionSchema = z
  .string({ required_error: 'Description is required.' })
  .trim()
  .min(5, 'Description must be at least 5 characters.')
  .max(100, 'Description must not exceed 100 characters.')
  .refine((val) => !/\d/.test(val), { message: 'Description must contain text only (numbers are not allowed).' });

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

// Password: min 6, max 50 chars
export const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .trim()
  .min(1, 'Password is required.')
  .min(6, 'Password must be at least 6 characters long.')
  .max(50, 'Password must not exceed 50 characters.');

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
  .max(500, 'Allowed IP addresses must not exceed 500 characters.')
  .refine(
    (value) => {
      if (!value || !value.trim()) return true;
      const rawIps = value.split(/[\n,\s]+/).map((s) => s.trim()).filter(Boolean);
      if (rawIps.length === 0) return true;
      return rawIps.every((ip) => isValidIpv4(ip));
    },
    { message: 'Invalid IP address format. Please enter valid IPv4 addresses (e.g. 192.168.1.1).' }
  );

// URL Schemas
export const urlSchema = (fieldName = 'URL') =>
  z.string({ required_error: `${fieldName} is required.` })
    .trim()
    .min(1, `${fieldName} is required.`)
    .max(300, `${fieldName} must not exceed 300 characters.`)
    .refine((val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, { message: `Please enter a valid URL (e.g. https://example.com).` });

export const optionalUrlSchema = (fieldName = 'URL') =>
  z.string()
    .trim()
    .max(300, `${fieldName} must not exceed 300 characters.`)
    .refine((val) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, { message: `Please enter a valid URL (e.g. https://example.com).` })
    .optional()
    .nullable();

