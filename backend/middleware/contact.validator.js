import { validate } from './validate.middleware.js';
import { contactRequestSchema } from '../validations/index.js';

export const contactRequestValidator = validate(contactRequestSchema);
