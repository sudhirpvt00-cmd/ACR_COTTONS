import prisma from '../config/prisma.js';

function parseProduct(p) {
  if (!p) return null;
  let images = [];
  try {
    images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  } catch {
    images = [p.images];
  }
  return { ...p, images };
}

export const cartController = {
  async getCart(req, res, next) {
    try {
      const userId = req.user.id;

      const items = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const parsedItems = items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        product: parseProduct(item.product),
      }));

      const totalCount = parsedItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = parsedItems.reduce(
        (sum, item) => sum + item.quantity * (item.product?.price || 0),
        0
      );
      // Free shipping above Rs 1999
      const shippingFee = subtotal > 1999 || subtotal === 0 ? 0 : 150;
      const total = subtotal + shippingFee;

      return res.json({
        success: true,
        items: parsedItems,
        summary: {
          itemCount: totalCount,
          subtotal,
          shippingFee,
          total,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async addToCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1, size } = req.body;

      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const qty = Math.max(1, parseInt(quantity, 10) || 1);

      // Check if already in user's cart
      const existing = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });

      let cartItem;
      if (existing) {
        cartItem = await prisma.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + qty,
            size: size || existing.size,
          },
          include: { product: true },
        });
      } else {
        cartItem = await prisma.cartItem.create({
          data: {
            userId,
            productId,
            quantity: qty,
            size: size || null,
          },
          include: { product: true },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Item added to your shopping bag',
        item: { ...cartItem, product: parseProduct(cartItem.product) },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateQuantity(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { quantity } = req.body;

      const existing = await prisma.cartItem.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      const newQty = parseInt(quantity, 10);
      if (newQty <= 0) {
        await prisma.cartItem.delete({ where: { id } });
        return res.json({ success: true, message: 'Item removed from bag' });
      }

      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity: newQty },
        include: { product: true },
      });

      return res.json({
        success: true,
        message: 'Bag updated',
        item: { ...updated, product: parseProduct(updated.product) },
      });
    } catch (err) {
      next(err);
    }
  },

  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existing = await prisma.cartItem.findFirst({
        where: { id, userId },
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      await prisma.cartItem.delete({ where: { id } });

      return res.json({
        success: true,
        message: 'Item removed from bag',
      });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req, res, next) {
    try {
      const userId = req.user.id;
      await prisma.cartItem.deleteMany({ where: { userId } });
      return res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
      next(err);
    }
  },
};
