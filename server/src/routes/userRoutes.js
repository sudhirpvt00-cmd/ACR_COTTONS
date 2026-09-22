import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { avatarUpload } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/avatar', avatarUpload.single('avatar'), userController.uploadAvatar);
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);

export default router;
