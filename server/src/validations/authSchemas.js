import { z } from 'zod';

const mobileRegex = /^[6-9]\d{9}$/;
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_-])[A-Za-z\d@$!%*?&#^~_-]{8,}$/;

export const loginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const sendRegisterOtpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters'),
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
});

export const sendLoginOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9'),
});

export const verifyLoginOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Invalid 10-digit mobile number'),
  otp: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const verifyOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Invalid 10-digit mobile number'),
  otp: z
    .string()
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  purpose: z
    .enum(['REGISTER', 'FORGOT_PASSWORD', 'LOGIN']),
});

export const completeRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters'),
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Invalid 10-digit mobile number'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const sendForgotOtpSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Please enter a valid 10-digit mobile number'),
});

export const resetPasswordSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(mobileRegex, 'Invalid 10-digit mobile number'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      strongPasswordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
