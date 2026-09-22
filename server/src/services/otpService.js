import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { hashValue, compareHash } from '../utils/hash.js';
import { devOtpProvider } from './otpProviders/devOtpProvider.js';
import { msg91Provider } from './otpProviders/msg91Provider.js';
import { twilioProvider } from './otpProviders/twilioProvider.js';

function getProvider() {
  switch (ENV.OTP_PROVIDER.toLowerCase()) {
    case 'msg91':
      return msg91Provider;
    case 'twilio':
      return twilioProvider;
    default:
      return devOtpProvider;
  }
}

export const otpService = {
  /**
   * Generate, hash and send a 6-digit OTP
   */
  async generateAndSendOTP({ mobile, purpose }) {
    // 1. Check existing active OTP for resend throttling
    const existing = await prisma.otpVerification.findFirst({
      where: { mobile, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const timeSinceLast = (Date.now() - new Date(existing.updatedAt).getTime()) / 1000;
      if (timeSinceLast < ENV.OTP_RESEND_WAIT_SECONDS) {
        const waitMore = Math.ceil(ENV.OTP_RESEND_WAIT_SECONDS - timeSinceLast);
        const err = new Error(`Please wait ${waitMore} seconds before requesting a new OTP.`);
        err.statusCode = 429;
        err.retryAfter = waitMore;
        throw err;
      }
    }

    // 2. Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await hashValue(otp);
    const expiresAt = new Date(Date.now() + ENV.OTP_EXPIRY_MINUTES * 60 * 1000);

    // 3. Upsert or create OTP record in database
    if (existing) {
      await prisma.otpVerification.update({
        where: { id: existing.id },
        data: {
          otpHash,
          expiresAt,
          attempts: 0,
          verified: false,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.otpVerification.create({
        data: {
          mobile,
          otpHash,
          purpose,
          expiresAt,
          attempts: 0,
          verified: false,
        },
      });
    }

    // 4. Send through configured provider
    const provider = getProvider();
    const dispatchResult = await provider.sendOTP({ mobile, otp, purpose });

    return {
      success: true,
      provider: provider.name,
      resendWaitSeconds: ENV.OTP_RESEND_WAIT_SECONDS,
      expiresInMinutes: ENV.OTP_EXPIRY_MINUTES,
      // Dev mode helper for instant testing
      devOtp: (ENV.OTP_PROVIDER === 'dev' || !ENV.OTP_PROVIDER) ? otp : undefined,
    };
  },

  /**
   * Verify an entered OTP against its hashed counterpart
   */
  async verifyOTP({ mobile, otp, purpose }) {
    const record = await prisma.otpVerification.findFirst({
      where: { mobile, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      const err = new Error('No OTP request found for this mobile number. Please request a new OTP.');
      err.statusCode = 400;
      throw err;
    }

    // Check maximum attempts
    if (record.attempts >= ENV.OTP_MAX_ATTEMPTS) {
      const err = new Error('Maximum OTP verification attempts exceeded. Please request a fresh OTP.');
      err.statusCode = 429;
      throw err;
    }

    // Check expiry
    if (new Date() > new Date(record.expiresAt)) {
      const err = new Error('This OTP has expired. Please request a new one.');
      err.statusCode = 400;
      throw err;
    }

    // Check match
    const isMatch = await compareHash(otp, record.otpHash);
    if (!isMatch) {
      const newAttempts = record.attempts + 1;
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: newAttempts },
      });

      const remaining = ENV.OTP_MAX_ATTEMPTS - newAttempts;
      const err = new Error(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Invalid OTP. Maximum attempts reached. Please request a new OTP.'
      );
      err.statusCode = 400;
      throw err;
    }

    // Mark verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return {
      success: true,
      message: 'OTP verified successfully.',
    };
  },

  /**
   * Check if the mobile has a valid, verified OTP session
   */
  async isOtpVerified({ mobile, purpose }) {
    const record = await prisma.otpVerification.findFirst({
      where: { mobile, purpose, verified: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!record) return false;
    // Must not be expired (5 min validity)
    if (new Date() > new Date(record.expiresAt)) return false;
    return true;
  },

  /**
   * Consume / invalidate the verified OTP after password creation
   */
  async consumeVerifiedOtp({ mobile, purpose }) {
    await prisma.otpVerification.deleteMany({
      where: { mobile, purpose },
    });
  },
};
