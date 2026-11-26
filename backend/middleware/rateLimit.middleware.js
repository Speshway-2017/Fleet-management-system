import rateLimit from 'express-rate-limit';
import { getClientIp, recordSecurityEvent } from '../services/securityMonitor.service.js';

/**
 * Reusable Rate Limiter Factory
 * Creates a rate limiter with custom standard headers, disabled legacy headers,
 * security monitoring persistence, and HTTP 429 JSON response payload.
 */
const createRateLimiter = (windowMs, max, message, category = 'RATE_LIMIT') => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    keyGenerator: (req) => getClientIp(req),
    handler: async (req, res) => {
      console.warn(
        `Rate Limit Triggered\nIP Address: ${getClientIp(req)}\nEndpoint: ${req.originalUrl || req.url}\nTimestamp: ${new Date().toISOString()}`
      );

      await recordSecurityEvent({
        category,
        severity: category === 'BRUTE_FORCE' ? 'High' : 'Medium',
        status: 'Blocked',
        req,
        reason: message,
        details: { windowMs, maxAllowed: max },
      });

      return res.status(429).json({
        success: false,
        message,
      });
    },
  });
};

// Login API Limit: 10 requests per 15 minutes
export const loginRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts. Please try again after 15 minutes.',
  'BRUTE_FORCE'
);

// Contact API Limit: 5 requests per 10 minutes
export const contactRateLimiter = createRateLimiter(
  10 * 60 * 1000,
  5,
  'Too many contact requests. Please try again later.'
);

// Forgot Password API Limit: 5 requests per 15 minutes
export const forgotPasswordRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many password reset attempts. Please try again after 15 minutes.',
  'BRUTE_FORCE'
);

// General API protection rate limit: 300 requests per minute per IP
export const apiRateLimiter = createRateLimiter(
  60 * 1000,
  300,
  'Too many API requests from this IP. Please slow down and try again shortly.'
);

// File upload rate limit: 30 uploads per 10 minutes per IP
export const uploadRateLimiter = createRateLimiter(
  10 * 60 * 1000,
  30,
  'Too many file upload requests. Please try again later.'
);
