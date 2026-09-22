import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'dhanu_textile_default_secret_key_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_NAME: process.env.COOKIE_NAME || 'dhanu_auth_token',
  
  // OTP Settings
  OTP_PROVIDER: process.env.OTP_PROVIDER || 'dev', // 'dev' | 'msg91' | 'twilio'
  OTP_EXPIRY_MINUTES: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
  OTP_RESEND_WAIT_SECONDS: parseInt(process.env.OTP_RESEND_WAIT_SECONDS || '30', 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),

  // Third party SMS stubs
  MSG91: {
    AUTH_KEY: process.env.MSG91_AUTH_KEY || '',
    TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || '',
    SENDER_ID: process.env.MSG91_SENDER_ID || '',
  },
  TWILIO: {
    ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
    PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  },
};
