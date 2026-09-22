import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma.js';
import { uploadsRoot } from '../middleware/uploadMiddleware.js';

export const userController = {
  async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          mobile: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          addresses: true,
        },
      });

      return res.json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;
      const userId = req.user.id;

      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
      }

      // Check if email changed and taken
      if (email && email !== req.user.email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
          return res.status(409).json({ success: false, message: 'Email address already in use' });
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name.trim(),
          ...(email && { email: email.trim().toLowerCase() }),
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

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAddresses(req, res, next) {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });
      return res.json({ success: true, addresses });
    } catch (err) {
      next(err);
    }
  },

  async addAddress(req, res, next) {
    try {
      const { fullName, mobile, street, city, state, pincode, isDefault } = req.body;

      if (!fullName || !mobile || !street || !city || !state || !pincode) {
        return res.status(400).json({ success: false, message: 'All address fields are required' });
      }

      // If isDefault, unset previous default
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: req.user.id },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: {
          userId: req.user.id,
          fullName,
          mobile,
          street,
          city,
          state,
          pincode,
          isDefault: !!isDefault,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Delivery address saved',
        address,
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please choose a profile photo to upload.',
        });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const previous = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { avatarUrl: true },
      });

      if (previous?.avatarUrl?.startsWith('/uploads/avatars/')) {
        const oldPath = path.join(uploadsRoot, previous.avatarUrl.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl },
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

      return res.json({
        success: true,
        message: 'Profile photo updated',
        user: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
