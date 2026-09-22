import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const tokenService = {
  generateToken(payload) {
    return jwt.sign(payload, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_EXPIRES_IN,
    });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, ENV.JWT_SECRET);
    } catch (err) {
      return null;
    }
  },

  setAuthCookie(res, token) {
    const isProduction = ENV.NODE_ENV === 'production';
    res.cookie(ENV.COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  },

  clearAuthCookie(res) {
    const isProduction = ENV.NODE_ENV === 'production';
    res.clearCookie(ENV.COOKIE_NAME, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });
  },
};
