import express from 'express';
import { createContactRequest } from '../controllers/contact.controller.js';
import { contactRequestValidator } from '../middleware/contact.validator.js';
import { contactRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/', contactRateLimiter, contactRequestValidator, createContactRequest);

export default router;
