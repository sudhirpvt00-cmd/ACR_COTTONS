import { Router } from 'express';
import { productController } from '../controllers/productController.js';

const router = Router();

router.get('/suggestions', productController.getSuggestions);
router.get('/:slug', productController.getProductBySlug);
router.get('/', productController.getProducts);

export default router;
