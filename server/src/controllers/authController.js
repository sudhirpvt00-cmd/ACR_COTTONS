import prisma from '../config/prisma.js';
import { hashValue, compareHash } from '../utils/hash.js';
import { otpService } from '../services/otpService.js';
import { tokenService } from '../services/tokenService.js';

export const authController = {
  /**
   * Step 1: Check uniqueness & send registration OTP
   */
  async sendRegisterOtp(req, res, next) {
    try {
      const { name, mobile, email } = req.body;

      // Check duplicate mobile
      const existingMobile = await prisma.user.findUnique({ where: { mobile } });
      if (existingMobile) {
        return res.status(409).json({
          success: false,
          message: 'An account is already registered with this mobile number. Please sign in.',
          errors: { mobile: 'Mobile number already registered' },
        });
      }

      // Check duplicate email
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account is already registered with this email address.',
          errors: { email: 'Email address already registered' },
        });
      }

      // Send OTP
      const otpResult = await otpService.generateAndSendOTP({
        mobile,
        purpose: 'REGISTER',
      });

      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to +91 ${mobile}`,
        resendWaitSeconds: otpResult.resendWaitSeconds,
        expiresInMinutes: otpResult.expiresInMinutes,
        devOtp: otpResult.devOtp, // Available in DEV mode for instant testing
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Step 2: Verify registration OTP
   */
  async verifyRegisterOtp(req, res, next) {
    try {
      const { mobile, otp } = req.body;

      const result = await otpService.verifyOTP({
        mobile,
        otp,
        purpose: 'REGISTER',
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Step 3: Complete registration & save user with hashed password
   */
  async completeRegistration(req, res, next) {
    try {
      const { name, mobile, email, password } = req.body;

      // Verify that the mobile was verified via OTP
      const isVerified = await otpService.isOtpVerified({
        mobile,
        purpose: 'REGISTER',
      });

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Mobile verification is required. Please verify OTP first.',
        });
      }

      // Re-check uniqueness in case of race conditions
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ mobile }, { email }],
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: existing.mobile === mobile
            ? 'Mobile number is already registered.'
            : 'Email address is already registered.',
        });
      }

      // Hash password
      const hashedPassword = await hashValue(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          mobile,
          email,
          password: hashedPassword,
          role: 'CUSTOMER',
        },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      // Invalidate the OTP session
      await otpService.consumeVerifiedOtp({ mobile, purpose: 'REGISTER' });

      // Issue JWT token in httpOnly cookie
      const token = tokenService.generateToken({
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
      });
      tokenService.setAuthCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Dhanu Textile.',
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Send Realtime OTP for Login
   */
  async sendLoginOtp(req, res, next) {
    try {
      const { mobile } = req.body;

      // Find user by mobile
      let user = await prisma.user.findUnique({ where: { mobile } });

      // If user does not exist, check if we should notify or help them
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account registered with this mobile number. Please register first.',
          errors: { mobile: 'Mobile number not found' },
        });
      }

      // Generate realtime OTP
      const otpResult = await otpService.generateAndSendOTP({
        mobile,
        purpose: 'LOGIN',
      });

      return res.status(200).json({
        success: true,
        message: `Realtime OTP sent successfully to +91 ${mobile}`,
        resendWaitSeconds: otpResult.resendWaitSeconds,
        expiresInMinutes: otpResult.expiresInMinutes,
        devOtp: otpResult.devOtp,
        isFirstLogin: !user.firstLoginDone,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Verify Realtime OTP for Login
   */
  async verifyLoginOtp(req, res, next) {
    try {
      const { mobile, otp } = req.body;

      const result = await otpService.verifyOTP({
        mobile,
        otp,
        purpose: 'LOGIN',
      });

      const user = await prisma.user.findUnique({
        where: { mobile },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found.',
        });
      }

      // Mark firstLoginDone as true
      await prisma.user.update({
        where: { id: user.id },
        data: { firstLoginDone: true },
      });

      // Consume OTP
      await otpService.consumeVerifiedOtp({ mobile, purpose: 'LOGIN' });

      // Issue JWT token
      const token = tokenService.generateToken({
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
      });
      tokenService.setAuthCookie(res, token);

      const sanitizedUser = {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstLoginDone: true,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      };

      return res.status(200).json({
        success: true,
        message: `OTP verified! Welcome to ACR Cottons, ${user.name}!`,
        user: sanitizedUser,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login with 10-digit mobile & password
   */
  async login(req, res, next) {
    try {
      const { mobile, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { mobile },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid mobile number or password. Please check your credentials.',
        });
      }

      const isPasswordValid = await compareHash(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid mobile number or password. Please check your credentials.',
        });
      }

      // Check if this is the user's first time logging in!
      // If first-time login: generate realtime OTP and prompt verification for maximum security!
      if (!user.firstLoginDone) {
        const otpResult = await otpService.generateAndSendOTP({
          mobile,
          purpose: 'LOGIN',
        });

        return res.status(200).json({
          success: true,
          requiresFirstLoginOtp: true,
          message: 'First-time login detected! A realtime security OTP has been generated.',
          mobile: user.mobile,
          name: user.name,
          resendWaitSeconds: otpResult.resendWaitSeconds,
          expiresInMinutes: otpResult.expiresInMinutes,
          devOtp: otpResult.devOtp,
        });
      }

      const token = tokenService.generateToken({
        userId: user.id,
        mobile: user.mobile,
        role: user.role,
      });
      tokenService.setAuthCookie(res, token);

      const sanitizedUser = {
        id: user.id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        firstLoginDone: user.firstLoginDone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      };

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        user: sanitizedUser,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Forgot password Step 1: Send OTP
   */
  async sendForgotOtp(req, res, next) {
    try {
      const { mobile } = req.body;

      const user = await prisma.user.findUnique({ where: { mobile } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account registered with this mobile number.',
          errors: { mobile: 'Mobile number not found' },
        });
      }

      const otpResult = await otpService.generateAndSendOTP({
        mobile,
        purpose: 'FORGOT_PASSWORD',
      });

      return res.status(200).json({
        success: true,
        message: `Password reset OTP sent to +91 ${mobile}`,
        resendWaitSeconds: otpResult.resendWaitSeconds,
        expiresInMinutes: otpResult.expiresInMinutes,
        devOtp: otpResult.devOtp,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Forgot password Step 2: Verify OTP
   */
  async verifyForgotOtp(req, res, next) {
    try {
      const { mobile, otp } = req.body;

      const result = await otpService.verifyOTP({
        mobile,
        otp,
        purpose: 'FORGOT_PASSWORD',
      });

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Forgot password Step 3: Set new password
   */
  async resetPassword(req, res, next) {
    try {
      const { mobile, newPassword } = req.body;

      const isVerified = await otpService.isOtpVerified({
        mobile,
        purpose: 'FORGOT_PASSWORD',
      });

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          message: 'OTP verification required before resetting password.',
        });
      }

      const user = await prisma.user.findUnique({ where: { mobile } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Account not found.',
        });
      }

      const hashedPassword = await hashValue(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await otpService.consumeVerifiedOtp({ mobile, purpose: 'FORGOT_PASSWORD' });

      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. Please sign in with your new password.',
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMe(req, res) {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  },

  /**
   * Sign out: clear auth cookie
   */
  async logout(req, res) {
    tokenService.clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Signed out successfully.',
    });
  },
};
