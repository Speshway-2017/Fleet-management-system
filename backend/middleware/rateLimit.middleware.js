import rateLimit from 'express-rate-limit';

/**
 * Reusable Rate Limiter Factory
 * Creates a rate limiter with custom standard headers, disabled legacy headers,
 * security logging, and HTTP 429 JSON response payload.
 */
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
      // Required security logs
      console.warn(`Rate Limit Triggered\nIP Address: ${req.ip}\nEndpoint: ${req.originalUrl || req.url}\nTimestamp: ${new Date().toISOString()}`);

      return res.status(429).json({
        success: false,
        message
      });
    }
  });
};

// Login API Limit: 5 requests per 15 minutes
export const loginRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again after 15 minutes."
);

// Contact API Limit: 5 requests per 10 minutes
export const contactRateLimiter = createRateLimiter(
  10 * 60 * 1000,
  5,
  "Too many contact requests. Please try again later."
);

// Forgot Password API Limit: 3 requests per 15 minutes
export const forgotPasswordRateLimiter = createRateLimiter(
  15 * 60 * 1000,
  3,
  "Too many password reset attempts. Please try again after 15 minutes."
);
