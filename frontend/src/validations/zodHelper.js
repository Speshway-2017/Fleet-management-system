import { ZodError } from 'zod';

/**
 * Validates form data against a Zod schema.
 * Returns an object with `{ isValid, errors, data }`
 * @param {import('zod').ZodSchema} schema
 * @param {object} formData
 */
export const validateForm = (schema, formData) => {
  const result = schema.safeParse(formData);
  if (result.success) {
    return { isValid: true, errors: {}, data: result.data };
  }

  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { isValid: false, errors, data: null };
};

/**
 * Validates a single field against a Zod schema property.
 * @param {import('zod').ZodSchema} schema
 * @param {string} fieldName
 * @param {any} value
 * @param {object} fullFormContext (optional full form context for refinements)
 */
export const validateField = (schema, fieldName, value, fullFormContext = {}) => {
  try {
    // If the schema is a ZodObject with shape
    if (schema && schema.shape && schema.shape[fieldName]) {
      const fieldSchema = schema.shape[fieldName];
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        return result.error.issues[0]?.message || 'Invalid value';
      }
      return '';
    }

    // Fallback: safeParse partial form data
    const partialData = { ...fullFormContext, [fieldName]: value };
    const result = schema.safeParse(partialData);
    if (!result.success) {
      const match = result.error.issues.find(issue => issue.path.includes(fieldName));
      if (match) return match.message;
    }
    return '';
  } catch {
    return '';
  }
};
