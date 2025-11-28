import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services';
import { successResponse, paginatedResponse, deletedResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * User Controller - Handles user management endpoints
 */
export class UserController {
  /**
   * Get user profile
   * GET /api/users/profile
   */
  static async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      const user = await UserService.getUserProfile(userId);

      res.status(200).json(successResponse(user));
    } catch (error) {
      logger.error('Get user profile controller error', error);
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  static async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      const user = await UserService.updateUserProfile(userId, req.body);

      res.status(200).json(successResponse(user, 'Profile updated successfully'));
    } catch (error) {
      logger.error('Update user profile controller error', error);
      next(error);
    }
  }

  /**
   * Get user by username
   * GET /api/users/:username
   */
  static async getUserByUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username } = req.params;

      const user = await UserService.getUserByUsername(username);

      res.status(200).json(successResponse(user));
    } catch (error) {
      logger.error('Get user by username controller error', error);
      next(error);
    }
  }

  /**
   * Get all users (admin only)
   * GET /api/users
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        role: req.query.role,
        isVerified: req.query.isVerified === 'true' ? true : undefined,
        search: req.query.search
      };

      const result = await UserService.getAllUsers(page, limit, filters);

      res.status(200).json(paginatedResponse(result.users, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get all users controller error', error);
      next(error);
    }
  }

  /**
   * Update user role (admin only)
   * PATCH /api/users/:id/role
   */
  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        res.status(400).json({
          success: false,
          error: 'Role is required'
        });
        return;
      }

      const user = await UserService.updateUserRole(id, role);

      res.status(200).json(successResponse(user, 'User role updated successfully'));
    } catch (error) {
      logger.error('Update user role controller error', error);
      next(error);
    }
  }

  /**
   * Delete user account
   * DELETE /api/users/:id
   */
  static async deleteUserAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const requestingUserId = (req as any).user?.userId;

      const result = await UserService.deleteUserAccount(id, requestingUserId);

      res.status(200).json(deletedResponse(result.message));
    } catch (error) {
      logger.error('Delete user account controller error', error);
      next(error);
    }
  }

  /**
   * Lock user account
   * PATCH /api/users/:id/lock
   */
  static async lockUserAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await UserService.lockUnlockAccount(id, true);

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Lock user account controller error', error);
      next(error);
    }
  }

  /**
   * Unlock user account
   * PATCH /api/users/:id/unlock
   */
  static async unlockUserAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const result = await UserService.lockUnlockAccount(id, false);

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Unlock user account controller error', error);
      next(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   */
  static async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await UserService.getUserStats(id);

      res.status(200).json(successResponse(stats));
    } catch (error) {
      logger.error('Get user stats controller error', error);
      next(error);
    }
  }

  /**
   * Search users
   * GET /api/users/search
   */
  static async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      const result = await UserService.searchUsers(query, page, limit);

      res.status(200).json(paginatedResponse(result.users, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Search users controller error', error);
      next(error);
    }
  }

  /**
   * Get user activity log
   * GET /api/users/:id/activity
   */
  static async getUserActivityLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const activity = await UserService.getUserActivityLog(id);

      res.status(200).json(successResponse(activity));
    } catch (error) {
      logger.error('Get user activity log controller error', error);
      next(error);
    }
  }

  /**
   * Bulk update users (admin only)
   * PATCH /api/users/bulk
   */
  static async bulkUpdateUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, updateData } = req.body;

      if (!userIds || !Array.isArray(userIds) || !updateData) {
        res.status(400).json({
          success: false,
          error: 'User IDs array and update data are required'
        });
        return;
      }

      const result = await UserService.bulkUpdateUsers(userIds, updateData);

      res.status(200).json(successResponse(result, 'Users updated successfully'));
    } catch (error) {
      logger.error('Bulk update users controller error', error);
      next(error);
    }
  }

  /**
   * Get my profile (current user)
   * GET /api/users/me
   */
  static async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      const user = await UserService.getUserProfile(userId);

      res.status(200).json(successResponse(user));
    } catch (error) {
      logger.error('Get my profile controller error', error);
      next(error);
    }
  }
}

export default UserController;