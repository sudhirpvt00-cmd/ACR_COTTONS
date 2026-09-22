import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env.js';

const isDev = ENV.NODE_ENV === 'development' || ENV.NODE_ENV === 'test';

// Strict limiter for sending OTPs to avoid SMS bombing and abuse
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isDev ? 1000 : 6, // generous for dev/tests
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many OTP requests from this connection. Please wait 10 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for login attempts to prevent brute-force attacks
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 10,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General auth endpoints limiter
export const authGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 60,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
