import { ZodError } from 'zod';
import { sendError } from '../utils/response.js';

/**
 * Express middleware to validate request payload using a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Property of `req` to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      // Parse data
      let dataToValidate = req[source];

      // If source is body and multipart/form-data gave managers as JSON string, parse it
      if (source === 'body' && dataToValidate && typeof dataToValidate.managers === 'string') {
        try {
          dataToValidate = {
            ...dataToValidate,
            managers: JSON.parse(dataToValidate.managers)
          };
        } catch {
          // keep as string if parse fails so zod catches invalid format
        }
      }

      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          // Preserve the first error message for each field path
          if (!fieldErrors[path]) {
            fieldErrors[path] = issue.message;
          }
        }
        const firstErrorMessage = error.issues[0]?.message || 'Validation failed';
        return sendError(res, 400, firstErrorMessage, fieldErrors);
      }
      return sendError(res, 400, error.message || 'Validation error');
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');
