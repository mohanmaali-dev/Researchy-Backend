import rateLimit from 'express-rate-limit';

import { env } from '../config/env.js';

export const globalRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many unsuccessful login attempts. Please try again later',
  },
});

export const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many email requests, please try again later',
  },
});
