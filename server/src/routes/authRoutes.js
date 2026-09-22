import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { otpLimiter, loginLimiter, authGeneralLimiter } from '../middleware/rateLimiter.js';
import {
  loginSchema,
  sendLoginOtpSchema,
  verifyLoginOtpSchema,
  sendRegisterOtpSchema,
  verifyOtpSchema,
  completeRegistrationSchema,
  sendForgotOtpSchema,
  resetPasswordSchema,
} from '../validations/authSchemas.js';

const router = Router();

// Apply general rate limiting to all auth routes
router.use(authGeneralLimiter);

// 1. Registration Flow
router.post(
  '/register/send-otp',
  otpLimiter,
  validateBody(sendRegisterOtpSchema),
  authController.sendRegisterOtp
);

router.post(
  '/register/verify-otp',
  validateBody(verifyOtpSchema),
  authController.verifyRegisterOtp
);

router.post(
  '/register/complete',
  validateBody(completeRegistrationSchema),
  authController.completeRegistration
);

// 2. Login
router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  authController.login
);

router.post(
  '/login/send-otp',
  otpLimiter,
  validateBody(sendLoginOtpSchema),
  authController.sendLoginOtp
);

router.post(
  '/login/verify-otp',
  validateBody(verifyLoginOtpSchema),
  authController.verifyLoginOtp
);

// 3. Forgot Password Flow
router.post(
  '/forgot-password/send-otp',
  otpLimiter,
  validateBody(sendForgotOtpSchema),
  authController.sendForgotOtp
);

router.post(
  '/forgot-password/verify-otp',
  validateBody(verifyOtpSchema),
  authController.verifyForgotOtp
);

router.post(
  '/forgot-password/reset',
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

// 4. Session management
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

export default router;
