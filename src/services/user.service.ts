import { User } from '../models';
import { NotFoundError, ForbiddenError, ValidationError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * User Service - Handles user profile management
 */
export class UserService {
  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId).select('-password -resetToken -activationCode');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user profile error', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updateData: any) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Only allow specific fields to be updated
      const allowedFields = ['fullName', 'avatar'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      Object.assign(user, filteredData);

      await user.save();

      logger.info(`User profile updated: ${userId}`);

      return user;
    } catch (error) {
      logger.error('Update user profile error', error);
      throw error;
    }
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string) {
    try {
      const user = await User.findOne({ username: username.toLowerCase() })
        .select('-password -resetToken -activationCode');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user by username error', error);
      throw error;
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAllUsers(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (filters.role) query.role = filters.role;
      if (filters.isVerified !== undefined) query.isVerified = filters.isVerified;
      if (filters.search) {
        query.$or = [
          { fullName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { username: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password -resetToken -activationCode')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        users,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get all users error', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, newRole: string) {
    try {
      const validRoles = ['student', 'admin'];

      if (!validRoles.includes(newRole)) {
        throw new ValidationError('Invalid role', { role: `Role must be one of: ${validRoles.join(', ')}` });
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.role = newRole as 'student' | 'admin';
      await user.save();

      logger.info(`User role updated: ${userId} - New role: ${newRole}`);

      return user;
    } catch (error) {
      logger.error('Update user role error', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteUserAccount(userId: string, requestingUserId: string) {
    try {
      // Check authorization - only user or admin can delete
      if (userId !== requestingUserId) {
        throw new ForbiddenError('You do not have permission to delete this account');
      }

      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      await User.deleteOne({ _id: userId });

      logger.info(`User account deleted: ${userId}`);

      return { message: 'Account deleted successfully' };
    } catch (error) {
      logger.error('Delete user account error', error);
      throw error;
    }
  }

  /**
   * Lock/Unlock user account
   */
  static async lockUnlockAccount(userId: string, lock: boolean) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      user.isLocked = lock;
      if (!lock) {
        user.lockUntil = null;
        user.loginAttempts = 0;
      }

      await user.save();

      const action = lock ? 'locked' : 'unlocked';
      logger.info(`User account ${action}: ${userId}`);

      return { message: `Account ${action} successfully` };
    } catch (error) {
      logger.error('Lock/Unlock account error', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string) {
    try {
      const user = await User.findById(userId)
        .select('-password -resetToken -activationCode');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        isLocked: user.isLocked,
        loginAttempts: user.loginAttempts
      };
    } catch (error) {
      logger.error('Get user stats error', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const searchQuery = {
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      };

      const total = await User.countDocuments(searchQuery);
      const users = await User.find(searchQuery)
        .select('-password -resetToken -activationCode')
        .skip(skip)
        .limit(limit);

      return {
        users,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Search users error', error);
      throw error;
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivityLog(userId: string) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return {
        userId: user._id,
        lastLogin: user.lastLogin,
        lastLogout: user.lastLogout,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isLocked: user.isLocked,
        lockUntil: user.lockUntil,
        loginAttempts: user.loginAttempts
      };
    } catch (error) {
      logger.error('Get user activity log error', error);
      throw error;
    }
  }

  /**
   * Bulk update users (admin only)
   */
  static async bulkUpdateUsers(userIds: string[], updateData: any) {
    try {
      const allowedFields = ['role', 'isLocked'];
      const filteredData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key];
          return obj;
        }, {} as any);

      const result = await User.updateMany(
        { _id: { $in: userIds } },
        filteredData
      );

      logger.info(`Bulk updated users: ${userIds.length}`);

      return {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      };
    } catch (error) {
      logger.error('Bulk update users error', error);
      throw error;
    }
  }
}

export default UserService;