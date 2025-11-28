// src/app.ts

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan'; // Will be imported after npm install
// import compression from 'compression'; // Will be imported after npm install

// Routes
import {
  authRoutes,
  courseRoutes,
  enrollmentRoutes,
  paymentRoutes,
  certificateRoutes,
  formRoutes,
  helpRoutes,
  analyticsRoutes,
  userRoutes
} from './routes';

// Middleware
import { errorHandler, requestLogger, requestValidator } from './middleware';

// Utils
import { logger } from './utils/logger';

/**
 * Express Application Factory
 */
export const createApp = (): Express => {
  const app = express();

  /**
   * ============================================================================
   * SECURITY MIDDLEWARE
   * ============================================================================
   */

  // Helmet - HTTP security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    }
  }));

  /**
   * ============================================================================
   * CORS CONFIGURATION
   * ============================================================================
   */

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  /**
   * ============================================================================
   * BODY PARSER MIDDLEWARE
   * ============================================================================
   */

  // Parse incoming JSON requests with size limit
  app.use(express.json({ limit: '10mb' }));

  // Parse incoming URL-encoded requests
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  /**
   * ============================================================================
   * COMPRESSION MIDDLEWARE
   * ============================================================================
   */

  // Compress responses for faster transmission
  // app.use(compression({
  //   level: 6,
  //   threshold: 1024 * 10 // Only compress responses larger than 10KB
  // }));

  /**
   * ============================================================================
   * LOGGING MIDDLEWARE
   * ============================================================================
   */

  // Morgan - HTTP request logger
  // const morganFormat = process.env.NODE_ENV === 'production' 
  //   ? 'combined' 
  //   : ':method :url :status :response-time ms';

  // app.use(morgan(morganFormat, {
  //   stream: {
  //     write: (message: string) => logger.info(message.trim())
  //   }
  // }));

  // Custom request logger
  app.use(requestLogger);

  /**
   * ============================================================================
   * REQUEST VALIDATION MIDDLEWARE
   * ============================================================================
   */

  app.use(requestValidator);

  /**
   * ============================================================================
   * HEALTH CHECK ENDPOINTS
   * ============================================================================
   */

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      service: 'Worldpedia Education Backend',
      status: 'Running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  /**
   * ============================================================================
   * API ROUTES MOUNTING
   * ============================================================================
   */

  // Auth Routes
  app.use('/api/auth', authRoutes);
  logger.info('✅ Auth routes mounted on /api/auth');

  // Course Routes
  app.use('/api/courses', courseRoutes);
  logger.info('✅ Course routes mounted on /api/courses');

  // Enrollment Routes
  app.use('/api/enrollments', enrollmentRoutes);
  logger.info('✅ Enrollment routes mounted on /api/enrollments');

  // Payment Routes
  app.use('/api/payments', paymentRoutes);
  logger.info('✅ Payment routes mounted on /api/payments');

  // Certificate Routes
  app.use('/api/certificates', certificateRoutes);
  logger.info('✅ Certificate routes mounted on /api/certificates');

  // Form Routes
  app.use('/api/forms', formRoutes);
  logger.info('✅ Form routes mounted on /api/forms');

  // Help Routes
  app.use('/api/help', helpRoutes);
  logger.info('✅ Help routes mounted on /api/help');

  // Analytics Routes
  app.use('/api/analytics', analyticsRoutes);
  logger.info('✅ Analytics routes mounted on /api/analytics');

  // User Routes
  app.use('/api/users', userRoutes);
  logger.info('✅ User routes mounted on /api/users');

  /**
   * ============================================================================
   * API DOCUMENTATION ENDPOINT
   * ============================================================================
   */

  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Worldpedia Education Backend API',
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: {
        auth: '/api/auth',
        courses: '/api/courses',
        enrollments: '/api/enrollments',
        payments: '/api/payments',
        certificates: '/api/certificates',
        forms: '/api/forms',
        help: '/api/help',
        analytics: '/api/analytics',
        users: '/api/users'
      },
      documentation: 'See CONTROLLERS_ROUTES_MAPPING.md for detailed endpoint documentation'
    });
  });

  /**
   * ============================================================================
   * 404 NOT FOUND HANDLER
   * ============================================================================
   */

  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: _req.path,
      method: _req.method,
      message: 'The requested resource does not exist. Check the API documentation.'
    });
  });

  /**
   * ============================================================================
   * ERROR HANDLING MIDDLEWARE
   * ============================================================================
   */

  app.use(errorHandler);

  return app;
};

export default createApp;