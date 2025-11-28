import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/error.types';
import { errorResponse, validationErrorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred', err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let details: any = undefined;

  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    // Handle validation errors
    if ('errors' in err && err.errors) {
      details = err.errors;
      res.status(statusCode).json(validationErrorResponse(err.errors as Record<string, string>));
      return;
    }
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = (err as any).errors;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry';
    const field = Object.keys((err as any).keyValue)[0];
    details = { [field]: `${field} already exists` };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Send error response
  if (statusCode === 400 && details) {
    res.status(statusCode).json(validationErrorResponse(details));
  } else {
    res.status(statusCode).json(errorResponse(message));
  }
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const statusCode = 404;
  const message = `Cannot ${req.method} ${req.path}`;
  
  res.status(statusCode).json(errorResponse(message));
};

/**
 * Async error wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default { errorHandler, notFoundHandler, asyncHandler };