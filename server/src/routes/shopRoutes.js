import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/prisma.js';

const router = Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.get('/info', (req, res) => {
  try {
    const filePath = path.resolve(__dirname, '../../../shop_files/details/shop_details.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return res.json({ success: true, shop: data });
    }
  } catch (err) {
    // ignore
  }

  // Fallback defaults
  return res.json({
    success: true,
    shop: {
      shopName: 'ACR Prints',
      legalName: 'ACR COTTONS',
      founder: 'A.C. RAJ KUMAR',
      tagline: 'Textiles Woven for Everyday Luxury',
      phone: '+91 87788 24123',
      whatsapp: '+91 87788 24123',
      email: 'contact@acrprints.com',
      address: {
        storeName: 'ACR Prints (ACR COTTONS)',
        street: '2, Sathya Moorthy Street, Surampatti Valasu',
        city: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638009',
      },
      openingHours: 'Mon - Fri: 8:00 AM - 8:00 PM (Closed Sat & Sun)',
    },
  });
});

router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, mobile, subject, message } = req.body || {};

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required.',
      });
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you. Our atelier team will reach you shortly.',
      inquiryId: inquiry.id,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
