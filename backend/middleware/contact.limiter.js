import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

export const contactRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 contact requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    return sendError(res, 429, 'Too many requests. You can only send 5 contact requests every 10 minutes.');
  }
});
