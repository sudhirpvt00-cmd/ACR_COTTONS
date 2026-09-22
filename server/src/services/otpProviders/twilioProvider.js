import { ENV } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

export const twilioProvider = {
  name: 'TWILIO',
  async sendOTP({ mobile, otp, purpose }) {
    if (!ENV.TWILIO.ACCOUNT_SID || !ENV.TWILIO.AUTH_TOKEN || !ENV.TWILIO.PHONE_NUMBER) {
      logger.warn('[Twilio] Credentials incomplete. Falling back to dev logger.');
      logger.otpBanner({ mobile, otp, purpose });
      return { success: true, provider: 'twilio-mock', devOtp: otp };
    }

    try {
      const formattedNumber = mobile.startsWith('+') ? mobile : `+91${mobile}`;
      const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.TWILIO.ACCOUNT_SID}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${ENV.TWILIO.ACCOUNT_SID}:${ENV.TWILIO.AUTH_TOKEN}`).toString('base64');

      const params = new URLSearchParams({
        To: formattedNumber,
        From: ENV.TWILIO.PHONE_NUMBER,
        Body: `Your Dhanu Textile verification code is ${otp}. Valid for 5 minutes. Please do not share it with anyone.`,
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Twilio API error');
      }

      return {
        success: true,
        provider: 'twilio',
        messageId: json.sid,
      };
    } catch (err) {
      logger.error('[Twilio Provider Error]', err.message);
      throw new Error(`SMS delivery failed: ${err.message}`);
    }
  },
};
