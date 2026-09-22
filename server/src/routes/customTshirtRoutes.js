import { Router } from 'express';
import { customTshirtController } from '../controllers/customTshirtController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadsRoot } from '../middleware/uploadMiddleware.js';

const router = Router();

const designsDir = path.join(uploadsRoot, 'custom-designs');
if (!fs.existsSync(designsDir)) {
  fs.mkdirSync(designsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, designsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.png';
    cb(null, `tshirt-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload custom design file
router.post('/upload-design', authenticate, upload.single('design'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No design file uploaded' });
  }
  const fileUrl = `/uploads/custom-designs/${req.file.filename}`;
  return res.json({
    success: true,
    fileUrl,
    message: 'Artwork uploaded successfully',
  });
});

// Customer routes
router.post('/orders', authenticate, customTshirtController.createCustomOrder);
router.get('/my-orders', authenticate, customTshirtController.getMyCustomOrders);
router.get('/orders/:id', authenticate, customTshirtController.getCustomOrderById);
router.patch('/orders/:id/cancel', authenticate, customTshirtController.cancelCustomOrder);

// Admin routes
router.get('/admin/all', authenticate, customTshirtController.getAllCustomOrdersAdmin);
router.patch('/admin/:id/status', authenticate, customTshirtController.updateCustomOrderStatusAdmin);

export default router;
