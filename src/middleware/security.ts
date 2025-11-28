import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from '../config/env';

/**
 * CORS Configuration
 */
export const corsMiddleware = cors({
  origin: config.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

/**
 * Helmet Security Headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"]
    }
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Remove X-Powered-By header
 */
export const removePoweredBy = (_req: Request, res: Response, next: NextFunction): void => {
  res.removeHeader('X-Powered-By');
  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
};

/**
 * Request body sanitization
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    const sanitizedBody: any = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        // Remove potential XSS vectors
        sanitizedBody[key] = value
          .replace(/[<>]/g, '')
          .trim();
      } else {
        sanitizedBody[key] = value;
      }
    }
    
    req.body = sanitizedBody;
  }
  
  next();
};

/**
 * Response security headers
 */
export const responseHeaders = (_req: Request, res: Response, next: NextFunction): void => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'"
  );
  
  next();
};

/**
 * API version middleware
 */
export const apiVersion = (_req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('API-Version', '1.0.0');
  next();
};

export default {
  corsMiddleware,
  helmetMiddleware,
  removePoweredBy,
  requestLogger,
  sanitizeInput,
  responseHeaders,
  apiVersion
};