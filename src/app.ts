import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

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
  userRoutes,
  emailRoutes,
  uploadRoutes,
  oauthRoutes
} from './routes';

// Middleware
import { globalErrorHandler, requestLogger, requestValidator } from './middleware';

// Utils
import { logger } from './utils/logger';

/**
 * Express Application Factory
 */
export const createApp = (): Express => {
  const app = express();

  /**
   * SECURITY & CONFIGURATION
   */
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

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  
  app.use(requestLogger);
  app.use(requestValidator);

  /**
   * SWAGGER DOCUMENTATION
   */
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  logger.info('✅ Swagger docs mounted on /api-docs');

  /**
   * ROOT ROUTE
   */
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Worldpedia Education Backend is Running! 🚀',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        api: '/api',
        docs: '/api-docs'
      }
    });
  });

  /**
   * HEALTH CHECK
   */
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  app.get('/api', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Worldpedia Education Backend API',
      version: '1.0.0',
      docs: '/api-docs'
    });
  });

  /**
   * ROUTES MOUNTING
   */
  app.use('/api/auth', authRoutes);
  app.use('/api/oauth', oauthRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/enrollments', enrollmentRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/certificates', certificateRoutes);
  app.use('/api/forms', formRoutes);
  app.use('/api/help', helpRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api/upload', uploadRoutes);

  /**
   * ERROR HANDLING
   */
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: _req.path,
      method: _req.method
    });
  });

  app.use(globalErrorHandler);

  return app;
};

export default createApp;