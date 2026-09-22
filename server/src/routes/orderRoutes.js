import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public or authenticated tracking endpoint
router.get('/track/:query', orderController.trackOrder);

// All other order routes require authentication
router.use(authenticate);

// Customer endpoints
router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/cancel', orderController.cancelOrder);

// Admin endpoints
router.get('/admin/all', orderController.getAllOrdersAdmin);
router.patch('/admin/:id/status', orderController.updateOrderStatusAdmin);

export default router;
