import { logger } from '../../utils/logger.js';

export const devOtpProvider = {
  name: 'DEV',
  async sendOTP({ mobile, otp, purpose }) {
    logger.otpBanner({ mobile, otp, purpose });
    return {
      success: true,
      provider: 'dev',
      messageId: `dev-${Date.now()}`,
      // In DEV mode, returning the otp in the provider response lets the dev-banner show it if desired
      devOtp: otp,
    };
  },
};
