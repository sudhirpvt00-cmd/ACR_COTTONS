import prisma from '../config/prisma.js';

export const customTshirtController = {
  // POST /api/custom-tshirt/orders - Place customized t-shirt printing order
  async createCustomOrder(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        tshirtColor = 'Pure White',
        fabricGsm = '180 GSM Bio-Washed Combed Cotton',
        printPosition = 'Front Chest',
        designPreviewUrl,
        customText,
        textColor,
        sizeBreakdown, // e.g. { S: 2, M: 4, L: 2, XL: 2 }
        totalQuantity,
        shippingAddress,
        notes,
      } = req.body;

      // STRICT VALIDATION: Minimum 10 orders required!
      const parsedQty = parseInt(totalQuantity, 10);
      if (isNaN(parsedQty) || parsedQty < 10) {
        return res.status(400).json({
          success: false,
          message: 'Minimum order quantity for customized t-shirt printing is 10 units. Please select at least 10 shirts.',
          minimumQuantity: 10,
          providedQuantity: parsedQty || 0,
        });
      }

      if (!designPreviewUrl) {
        return res.status(400).json({
          success: false,
          message: 'Please provide or upload your custom design artwork before placing an order.',
        });
      }

      if (!shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Delivery address is required.',
        });
      }

      // Calculate unit price based on volume tier
      let pricePerUnit = 299;
      if (parsedQty >= 50) {
        pricePerUnit = 239;
      } else if (parsedQty >= 25) {
        pricePerUnit = 269;
      }
      const totalAmount = pricePerUnit * parsedQty;

      // Unique IDs
      const timePart = Date.now().toString().slice(-4);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ACR-TSHIRT-${timePart}${randomSuffix}`;
      const trackingNumber = `ACR-TRK-TSHIRT-${timePart}${randomSuffix}`;

      const now = new Date();
      const initialTimeline = [
        {
          step: 1,
          title: 'Custom Artwork & Vector Verified',
          description: 'Artwork resolution checked for high-density screen printing at Erode Atelier',
          timestamp: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          completed: true,
          current: true,
        },
        {
          step: 2,
          title: 'Fabric Prep & Screen Alignment',
          description: `${fabricGsm} fabric staged & high-mesh screens aligned`,
          timestamp: 'Scheduled',
          completed: false,
        },
        {
          step: 3,
          title: 'Printing & Pigment Curing',
          description: 'Multi-layer eco pigment print & precision heat tunnel cure',
          timestamp: 'Pending',
          completed: false,
        },
        {
          step: 4,
          title: 'Dispatched from Erode Workshop',
          description: 'Sealed & handed over to DTDC Royal Air Cargo',
          timestamp: 'Pending',
          completed: false,
        },
        {
          step: 5,
          title: 'Delivered',
          description: 'Delivery to client doorstep with inspection signoff',
          timestamp: 'Pending',
          completed: false,
        },
      ];

      const estDelivery = new Date();
      estDelivery.setDate(estDelivery.getDate() + 5);

      const customOrder = await prisma.customTshirtOrder.create({
        data: {
          orderNumber,
          trackingNumber,
          userId,
          tshirtColor,
          fabricGsm,
          printPosition,
          designPreviewUrl,
          customText: customText || null,
          textColor: textColor || null,
          sizeBreakdown: typeof sizeBreakdown === 'string' ? sizeBreakdown : JSON.stringify(sizeBreakdown || {}),
          totalQuantity: parsedQty,
          pricePerUnit,
          totalAmount,
          shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
          paymentMethod: 'COD',
          status: 'DESIGN_CONFIRMED',
          carrier: 'DTDC Royal Air Cargo',
          estimatedDelivery: estDelivery,
          trackingUpdates: JSON.stringify(initialTimeline),
          notes: notes || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: `Custom order of ${parsedQty} t-shirts placed successfully! Your tracking ID is ${trackingNumber}.`,
        order: {
          ...customOrder,
          shippingAddress: typeof customOrder.shippingAddress === 'string' ? JSON.parse(customOrder.shippingAddress) : customOrder.shippingAddress,
          sizeBreakdown: typeof customOrder.sizeBreakdown === 'string' ? JSON.parse(customOrder.sizeBreakdown) : customOrder.sizeBreakdown,
          trackingUpdates: initialTimeline,
        },
        trackingNumber,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/custom-tshirt/my-orders - User's custom t-shirt orders
  async getMyCustomOrders(req, res, next) {
    try {
      const userId = req.user.id;
      const orders = await prisma.customTshirtOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const parsedOrders = orders.map((o) => ({
        ...o,
        shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
        sizeBreakdown: typeof o.sizeBreakdown === 'string' ? JSON.parse(o.sizeBreakdown) : o.sizeBreakdown,
        trackingUpdates: typeof o.trackingUpdates === 'string' ? JSON.parse(o.trackingUpdates) : (o.trackingUpdates || []),
      }));

      return res.json({
        success: true,
        orders: parsedOrders,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/custom-tshirt/orders/:id - Single custom order
  async getCustomOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      const order = await prisma.customTshirtOrder.findFirst({
        where: {
          id,
          ...(isAdmin ? {} : { userId }),
        },
        include: {
          user: {
            select: { name: true, mobile: true, email: true },
          },
        },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Custom T-shirt order not found.',
        });
      }

      return res.json({
        success: true,
        order: {
          ...order,
          shippingAddress: typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress,
          sizeBreakdown: typeof order.sizeBreakdown === 'string' ? JSON.parse(order.sizeBreakdown) : order.sizeBreakdown,
          trackingUpdates: typeof order.trackingUpdates === 'string' ? JSON.parse(order.trackingUpdates) : (order.trackingUpdates || []),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: GET /api/custom-tshirt/admin/all - Get all custom t-shirt orders
  async getAllCustomOrdersAdmin(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const orders = await prisma.customTshirtOrder.findMany({
        include: {
          user: {
            select: { name: true, mobile: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({
        success: true,
        orders: orders.map((o) => ({
          ...o,
          shippingAddress: typeof o.shippingAddress === 'string' ? JSON.parse(o.shippingAddress) : o.shippingAddress,
          sizeBreakdown: typeof o.sizeBreakdown === 'string' ? JSON.parse(o.sizeBreakdown) : o.sizeBreakdown,
          trackingUpdates: typeof o.trackingUpdates === 'string' ? JSON.parse(o.trackingUpdates) : (o.trackingUpdates || []),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: PATCH /api/custom-tshirt/admin/:id/status - Update custom order status
  async updateCustomOrderStatusAdmin(req, res, next) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
      }

      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['DESIGN_CONFIRMED', 'PRINTING', 'QUALITY_INSPECTION', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const order = await prisma.customTshirtOrder.findUnique({ where: { id } });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Custom order not found' });
      }

      let timeline = [];
      try {
        timeline = typeof order.trackingUpdates === 'string' ? JSON.parse(order.trackingUpdates) : (order.trackingUpdates || []);
      } catch {
        timeline = [];
      }

      // Update timeline step completion based on status
      const nowStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      if (status === 'PRINTING') {
        if (timeline[1]) { timeline[1].completed = true; timeline[1].timestamp = nowStr; }
        if (timeline[2]) { timeline[2].current = true; }
      } else if (status === 'QUALITY_INSPECTION') {
        if (timeline[1]) { timeline[1].completed = true; }
        if (timeline[2]) { timeline[2].completed = true; timeline[2].timestamp = nowStr; }
        if (timeline[3]) { timeline[3].current = true; }
      } else if (status === 'DISPATCHED') {
        if (timeline[1]) { timeline[1].completed = true; }
        if (timeline[2]) { timeline[2].completed = true; }
        if (timeline[3]) { timeline[3].completed = true; timeline[3].timestamp = nowStr; }
        if (timeline[4]) { timeline[4].current = true; }
      } else if (status === 'DELIVERED') {
        timeline.forEach((t) => { t.completed = true; t.current = false; });
        if (timeline[4]) { timeline[4].timestamp = nowStr; timeline[4].current = true; }
      }

      const updated = await prisma.customTshirtOrder.update({
        where: { id },
        data: {
          status,
          trackingUpdates: JSON.stringify(timeline),
        },
      });

      return res.json({
        success: true,
        message: `Custom T-shirt order status updated to ${status}`,
        order: {
          ...updated,
          trackingUpdates: timeline,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/custom-tshirt/orders/:id/cancel - Cancel custom order
  async cancelCustomOrder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { reason } = req.body;

      const order = await prisma.customTshirtOrder.findFirst({
        where: { id, userId },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Custom order not found.',
        });
      }

      if (order.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'This custom order is already cancelled.',
        });
      }

      if (order.status === 'DISPATCHED' || order.status === 'DELIVERED') {
        return res.status(400).json({
          success: false,
          message: 'This order has already been dispatched and cannot be cancelled online. Please contact ACR Cottons on WhatsApp (+91 87788 24123) for priority concierge assistance.',
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
        description: reason ? `Cancelled: ${reason}` : 'Cancelled by customer before dispatch',
        timestamp: nowStr,
        completed: true,
      });

      const updated = await prisma.customTshirtOrder.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          trackingUpdates: JSON.stringify(timeline),
        },
      });

      return res.json({
        success: true,
        message: 'Your custom t-shirt order has been cancelled successfully.',
        order: {
          ...updated,
          trackingUpdates: timeline,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
