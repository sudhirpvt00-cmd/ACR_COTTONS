import prisma from '../config/prisma.js';

function parseImages(images) {
  if (!images) return [];
  try {
    return typeof images === 'string' ? JSON.parse(images) : images;
  } catch {
    return [images];
  }
}

function parseOrder(order) {
  if (!order) return null;
  let parsedAddress = {};
  try {
    parsedAddress = typeof order.shippingAddress === 'string'
      ? JSON.parse(order.shippingAddress)
      : order.shippingAddress;
  } catch {
    parsedAddress = { addressText: order.shippingAddress };
  }

  return {
    ...order,
    shippingAddress: parsedAddress,
    items: order.items?.map((item) => ({
      ...item,
      product: item.product ? {
        ...item.product,
        images: parseImages(item.product.images),
      } : undefined,
    })) || [],
  };
}

export const orderController = {
  // POST /api/orders - Create order from user's cart
  async createOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const { addressId, shippingAddress, paymentMethod = 'COD', notes } = req.body;

      // 1. Fetch user cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping bag is empty. Please add items before checking out.',
        });
      }

      // 2. Resolve Shipping Address
      let finalAddress = null;

      if (addressId) {
        const addr = await prisma.address.findFirst({
          where: { id: addressId, userId },
        });
        if (!addr) {
          return res.status(404).json({
            success: false,
            message: 'Selected delivery address was not found.',
          });
        }
        finalAddress = {
          fullName: addr.fullName,
          mobile: addr.mobile,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          pincode: addr.pincode,
        };
      } else if (shippingAddress) {
        const { fullName, mobile, street, city, state, pincode, saveAddress } = shippingAddress;
        if (!fullName || !mobile || !street || !city || !state || !pincode) {
          return res.status(400).json({
            success: false,
            message: 'All delivery address fields (Name, Mobile, Street, City, State, PIN) are required.',
          });
        }
        finalAddress = { fullName, mobile, street, city, state, pincode };

        // Save address to user address book if requested or if user has no saved addresses
        if (saveAddress) {
          await prisma.address.create({
            data: {
              userId,
              fullName,
              mobile,
              street,
              city,
              state,
              pincode,
              isDefault: false,
            },
          });
        }
      } else {
        // Check if user has a default address
        const defaultAddr = await prisma.address.findFirst({
          where: { userId, isDefault: true },
        }) || await prisma.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });

        if (!defaultAddr) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a delivery address.',
          });
        }

        finalAddress = {
          fullName: defaultAddr.fullName,
          mobile: defaultAddr.mobile,
          street: defaultAddr.street,
          city: defaultAddr.city,
          state: defaultAddr.state,
          pincode: defaultAddr.pincode,
        };
      }

      // 3. Compute Totals & Validate Stock
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of cartItems) {
        const product = item.product;
        if (!product) continue;

        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        const images = parseImages(product.images);
        const mainImage = images.length > 0 ? images[0] : null;

        orderItemsData.push({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: item.quantity,
          size: item.size || null,
          imageUrl: mainImage,
        });
      }

      // Free shipping over Rs 1999, else Rs 150
      const shippingFee = subtotal > 1999 ? 0 : 150;
      const totalAmount = subtotal + shippingFee;

      // 4. Generate unique order number and tracking number
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const timePart = Date.now().toString().slice(-4);
      const orderNumber = `ACR-ORD-${timePart}${randomSuffix}`;
      const trackingNumber = `ACR-TRK-${timePart}${randomSuffix}`;

      const now = new Date();
      const initialTimeline = [
        {
          step: 1,
          title: 'Order Confirmed',
          description: 'Order placed & assigned to Erode Atelier',
          timestamp: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          completed: true,
          current: true,
        },
        {
          step: 2,
          title: 'Artisan Quality Inspection',
          description: 'Handloom weave and stitch density verified',
          timestamp: 'Scheduled',
          completed: false,
        },
        {
          step: 3,
          title: 'Packed & Dispatched from Erode',
          description: 'Sealed with royal wax seal and handover to express courier',
          timestamp: 'Pending',
          completed: false,
        },
        {
          step: 4,
          title: 'In Transit',
          description: 'Dispatched via Erode Express Logistics air consignment',
          timestamp: 'Pending',
          completed: false,
        },
        {
          step: 5,
          title: 'Delivered',
          description: 'Delivery to doorstep with signature confirmation',
          timestamp: 'Pending',
          completed: false,
        },
      ];

      // Estimated delivery: 3 to 4 days from now
      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 3);

      // 5. Database transaction: Create order + order items, decrement stock, clear cart
      const createdOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            trackingNumber,
            userId,
            totalAmount,
            shippingFee,
            status: 'PLACED',
            carrier: 'Erode Express Logistics',
            estimatedDelivery: estDelivery,
            trackingUpdates: JSON.stringify(initialTimeline),
            paymentMethod: paymentMethod === 'PAY_AT_SHOP' ? 'PAY_AT_SHOP' : 'COD',
            paymentStatus: 'PENDING',
            shippingAddress: JSON.stringify(finalAddress),
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: true,
          },
        });

        // Decrement stock for purchased items
        for (const item of cartItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Clear user's cart
        await tx.cartItem.deleteMany({
          where: { userId },
        });

        return order;
      });

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully! We are preparing your textile package.',
        order: parseOrder(createdOrder),
        trackingNumber,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders - Fetch list of user's orders
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user.id;

      const orders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const parsedOrders = orders.map(parseOrder);

      return res.json({
        success: true,
        orders: parsedOrders,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/:id - Fetch single order details
  async getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      const order = await prisma.order.findFirst({
        where: {
          id,
          ...(isAdmin ? {} : { userId }),
        },
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: {
              id: true,
              name: true,
              mobile: true,
              email: true,
            },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      return res.json({
        success: true,
        order: parseOrder(order),
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/orders/:id/cancel - Cancel order if not yet shipped
  async cancelOrder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const order = await prisma.order.findFirst({
        where: { id, userId },
        include: { items: true },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      if (order.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'This order is already cancelled.',
        });
      }

      if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        return res.status(400).json({
          success: false,
          message: 'This order has already been dispatched and cannot be cancelled online. Please contact ACR Prints on WhatsApp (+91 87788 24123) for assistance.',
        });
      }

      let timeline = [];
      try {
        timeline = typeof order.trackingUpdates === 'string' ? JSON.parse(order.trackingUpdates) : (order.trackingUpdates || []);
      } catch {
        timeline = [];
      }

      const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      timeline.push({
        step: 99,
        title: 'Order Cancelled',
        description: reason ? `Cancelled: ${reason}` : 'Cancelled by customer before dispatch. Handloom stock restored.',
        timestamp: nowStr,
        completed: true,
      });

      // Restock products and set status to CANCELLED
      const updatedOrder = await prisma.$transaction(async (tx) => {
        // Restore stock
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return await tx.order.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            trackingUpdates: JSON.stringify(timeline),
          },
          include: {
            items: true,
          },
        });
      });

      return res.json({
        success: true,
        message: 'Your order has been cancelled successfully.',
        order: parseOrder(updatedOrder),
      });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: GET /api/orders/admin/all - Get all orders
  async getAllOrdersAdmin(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { status } = req.query;
      const orders = await prisma.order.findMany({
        where: status ? { status } : {},
        include: {
          items: true,
          user: {
            select: { id: true, name: true, mobile: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        orders: orders.map(parseOrder),
      });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: PATCH /api/orders/admin/:id/status - Update order status
  async updateOrderStatusAdmin(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const { status, paymentStatus } = req.body;

      const validStatuses = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const updated = await prisma.order.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
        },
        include: {
          items: true,
          user: true,
        },
      });

      return res.json({
        success: true,
        message: `Order status updated to ${status || updated.status}`,
        order: parseOrder(updated),
      });
    } catch (err) {
      next(err);
    }
  },

  // PUBLIC / AUTH: GET /api/orders/track/:query - Universal tracking by Order # or Tracking #
  async trackOrder(req, res, next) {
    try {
      const { query } = req.params;
      const cleanQuery = (query || '').trim();

      if (!cleanQuery) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid Order Number or Tracking Number.',
        });
      }

      // 1. Search in regular Orders
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: cleanQuery },
            { trackingNumber: cleanQuery },
            { id: cleanQuery },
          ],
        },
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: { name: true, mobile: true },
          },
        },
      });

      if (order) {
        let timeline = [];
        try {
          timeline = typeof order.trackingUpdates === 'string'
            ? JSON.parse(order.trackingUpdates)
            : (order.trackingUpdates || []);
        } catch {
          timeline = [];
        }

        // If timeline is empty, build standard 5-step timeline based on current status
        if (!timeline || timeline.length === 0) {
          const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED';
          const isDelivered = order.status === 'DELIVERED';
          timeline = [
            { step: 1, title: 'Order Confirmed', description: 'Verified at Erode Flagship Atelier', completed: true, current: order.status === 'PLACED' },
            { step: 2, title: 'Quality Inspection', description: 'Artisan textile inspection', completed: order.status !== 'PLACED', current: order.status === 'CONFIRMED' },
            { step: 3, title: 'Packed & Dispatched', description: 'Sealed & handed to carrier', completed: isShipped, current: false },
            { step: 4, title: 'In Transit', description: 'Dispatched via Erode Express Logistics', completed: isShipped, current: isShipped && !isDelivered },
            { step: 5, title: 'Delivered', description: 'Delivered to recipient', completed: isDelivered, current: isDelivered },
          ];
        }

        return res.json({
          success: true,
          type: 'REGULAR_ORDER',
          order: {
            ...parseOrder(order),
            trackingUpdates: timeline,
          },
        });
      }

      // 2. Search in Custom T-Shirt Orders
      const customOrder = await prisma.customTshirtOrder.findFirst({
        where: {
          OR: [
            { orderNumber: cleanQuery },
            { trackingNumber: cleanQuery },
            { id: cleanQuery },
          ],
        },
        include: {
          user: {
            select: { name: true, mobile: true },
          },
        },
      });

      if (customOrder) {
        let timeline = [];
        try {
          timeline = typeof customOrder.trackingUpdates === 'string'
            ? JSON.parse(customOrder.trackingUpdates)
            : (customOrder.trackingUpdates || []);
        } catch {
          timeline = [];
        }

        let address = {};
        try {
          address = JSON.parse(customOrder.shippingAddress);
        } catch {
          address = { text: customOrder.shippingAddress };
        }

        let sizeBreakdown = {};
        try {
          sizeBreakdown = JSON.parse(customOrder.sizeBreakdown);
        } catch {
          sizeBreakdown = {};
        }

        return res.json({
          success: true,
          type: 'CUSTOM_TSHIRT',
          order: {
            ...customOrder,
            shippingAddress: address,
            sizeBreakdown,
            trackingUpdates: timeline,
          },
        });
      }

      return res.status(404).json({
        success: false,
        message: `No consignment or order found for "${cleanQuery}". Please check the number and try again.`,
      });
    } catch (err) {
      next(err);
    }
  },
};
