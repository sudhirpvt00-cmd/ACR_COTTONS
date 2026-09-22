import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { logger } from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import userRoutes from './routes/userRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import customTshirtRoutes from './routes/customTshirtRoutes.js';
import { uploadsRoot } from './middleware/uploadMiddleware.js';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(uploadsRoot));

// Request logger
app.use((req, res, next) => {
  if (ENV.NODE_ENV === 'development') {
    logger.info(`${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Dhanu Textile API',
    time: new Date().toISOString(),
    otpProvider: ENV.OTP_PROVIDER,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user', userRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-tshirt', customTshirtRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    ...(ENV.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const server = app.listen(ENV.PORT, '0.0.0.0', () => {
  logger.info(`✨ Dhanu Textile Server running on http://localhost:${ENV.PORT} (and http://127.0.0.1:${ENV.PORT})`);
  logger.info(`🔒 Mode: ${ENV.NODE_ENV} | OTP Provider: ${ENV.OTP_PROVIDER}`);
});

export default app;
