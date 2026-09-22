import { ENV } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const msg91Provider = {
  name: 'MSG91',
  async sendOTP({ mobile, otp, purpose }) {
    if (!ENV.MSG91.AUTH_KEY) {
      logger.warn('[MSG91] Auth key not provided. Falling back to dev logger.');
      logger.otpBanner({ mobile, otp, purpose });
      return { success: true, provider: 'msg91-mock', devOtp: otp };
    }

    // MSG91 Send OTP endpoint: https://control.msg91.com/api/v5/otp
    try {
      const response = await fetch('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'authkey': ENV.MSG91.AUTH_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          template_id: ENV.MSG91.TEMPLATE_ID,
          mobile: `91${mobile}`, // Format Indian mobile number
          otp: otp,
        }),
      });

      const data = await response.json();
      if (data.type === 'error') {
        throw new Error(data.message || 'MSG91 API error');
      }

      return {
        success: true,
        provider: 'msg91',
        messageId: data.message || 'sent',
      };
    } catch (err) {
      logger.error('[MSG91 Provider Error]', err.message);
      throw new Error(`SMS delivery failed: ${err.message}`);
    }
  },
};
