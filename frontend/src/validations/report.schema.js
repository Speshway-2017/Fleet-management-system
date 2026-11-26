import { z } from 'zod';

export const validateScheduleName = (val) => {
  if (!val || !val.trim()) return "Schedule name is required.";
  const trimmed = val.trim();
  if (trimmed.length < 3) return "Schedule name must be at least 3 characters.";
  if (trimmed.length > 60) return "Schedule name cannot exceed 60 characters.";
  if (!/[a-zA-Z]/.test(trimmed)) return "Schedule name must contain descriptive text.";
  if (!/^[a-zA-Z0-9\s.\-_&()]+$/.test(trimmed)) {
    return "Schedule name can only contain letters, numbers, spaces, and standard symbols (-_.&()).";
  }
  if (/(.)\1{3,}/i.test(trimmed)) return "Schedule name contains invalid repeated characters.";
  return "";
};

export const validateRecipientsList = (val) => {
  if (!val || !val.trim()) return "Recipient email(s) are required.";
  const trimmed = val.trim();
  if (trimmed.length > 255) return "Recipients list cannot exceed 255 characters.";

  const emailList = trimmed
    .split(/[,;\s]+/)
    .map((e) => e.trim())
    .filter(Boolean);

  if (emailList.length === 0) {
    return "At least one recipient email address is required.";
  }

  const seen = new Set();
  for (const email of emailList) {
    if (email.length < 5 || email.length > 60) {
      return `Email '${email}' must be between 5 and 60 characters.`;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return `Invalid email address format: '${email}'.`;
    }
    if (/(.)\1{4,}/i.test(email)) {
      return `Email '${email}' contains invalid repeated characters.`;
    }
    const lower = email.toLowerCase();
    if (seen.has(lower)) {
      return `Duplicate recipient email detected: '${email}'.`;
    }
    seen.add(lower);
  }

  return "";
};

export const validateScheduleField = (fieldName, value) => {
  switch (fieldName) {
    case 'name':
      return validateScheduleName(value);
    case 'recipients':
      return validateRecipientsList(value);
    default:
      return "";
  }
};

export const validateAllScheduleFields = (data) => {
  const errors = {};
  const nameErr = validateScheduleName(data.name);
  if (nameErr) errors.name = nameErr;

  const recipientsErr = validateRecipientsList(data.recipients);
  if (recipientsErr) errors.recipients = recipientsErr;

  return errors;
};

export const reportScheduleSchema = z.object({
  name: z
    .string({ required_error: 'Schedule name is required.' })
    .trim()
    .min(3, 'Schedule name must be at least 3 characters.')
    .max(60, 'Schedule name cannot exceed 60 characters.')
    .refine((val) => /[a-zA-Z]/.test(val), { message: 'Schedule name must contain descriptive text.' })
    .refine((val) => /^[a-zA-Z0-9\s.\-_&()]+$/.test(val), {
      message: 'Schedule name can only contain letters, numbers, spaces, and standard symbols (-_.&()).'
    })
    .refine((val) => !/(.)\1{3,}/i.test(val), {
      message: 'Schedule name contains invalid repeated characters.'
    }),
  type: z.enum(['Operational', 'Financial', 'Compliance', 'Safety']).default('Operational'),
  frequency: z.enum(['Daily', 'Weekly', 'Monthly', 'Quarterly']).default('Weekly'),
  day: z.string().optional(),
  time: z.string().optional(),
  format: z.enum(['PDF', 'CSV', 'Excel', 'XLSX']).default('PDF'),
  recipients: z
    .string({ required_error: 'Recipient email(s) are required.' })
    .trim()
    .max(255, 'Recipients list cannot exceed 255 characters.')
    .refine((val) => validateRecipientsList(val) === '', {
      message: 'Please provide valid recipient email address(es).'
    }),
  status: z.enum(['Active', 'Paused']).default('Active')
});
