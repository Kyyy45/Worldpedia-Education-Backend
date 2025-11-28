import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../types/error.types';

/**
 * Check if user has required role
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required');
  }

  next();
};

/**
 * Check if user is student
 */
export const isStudent = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.role !== 'student' && req.user.role !== 'admin') {
    throw new ForbiddenError('Student access required');
  }

  next();
};

/**
 * Check if user owns the resource
 */
export const isResourceOwner = (userIdParam: string = 'userId') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const resourceUserId = req.params[userIdParam];

    if (req.user.userId !== resourceUserId && req.user.role !== 'admin') {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};

/**
 * Verify request body includes required fields
 */
export const requireFields = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const missingFields = fields.filter(field => !(field in req.body));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    next();
  };
};

export default {
  authorize,
  isAdmin,
  isStudent,
  isResourceOwner,
  requireFields
};