import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.patch('/:id', cartController.updateQuantity);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;
