import prisma from '../config/prisma.js';
import { tokenService } from '../services/tokenService.js';
import { ENV } from '../config/env.js';

export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.[ENV.COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const decoded = tokenService.verifyToken(token);
    if (!decoded || !decoded.userId) {
      tokenService.clearAuthCookie(res);
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid. Please sign in again.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      tokenService.clearAuthCookie(res);
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
}
