// src/middleware/index.ts

/**
 * Central export point for all middleware
 */

export { authenticate, optionalAuth, ensureAuthenticated } from './auth';
export { authorize, isAdmin, isStudent, isResourceOwner, requireFields } from './authorization';
export { errorHandler as globalErrorHandler } from './error-handler.middleware';
export { requestValidator, requestLogger, requestIdMiddleware } from './request-validator.middleware';
export {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  verifyCodeLimiter,
  resendCodeLimiter,
  forgotPasswordLimiter,
  paymentLimiter,
  userApiLimiter
} from './rateLimit';
export {
  corsMiddleware,
  helmetMiddleware,
  removePoweredBy,
  sanitizeInput,
  responseHeaders,
  apiVersion
} from './security';