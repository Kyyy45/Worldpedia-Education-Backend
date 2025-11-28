import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import config from '../config/env';
import { 
  UnauthorizedError, 
  ConflictError, 
  NotFoundError
} from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Auth Service - Handles user authentication and token management
 */
export class AuthService {
  /**
   * Register new user
   */
  static async register(
    fullName: string,
    username: string,
    email: string,
    password: string
  ) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
        throw new ConflictError(`User with this ${field} already exists`);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user - Schema validation will handle password/username validation
      const user = new User({
        fullName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'student',
        isVerified: false
      });

      await user.save();

      logger.info(`User registered: ${email}`);

      return {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      logger.error('Registration error', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(usernameOrEmail: string, password: string) {
    try {
      // Find user
      const user = await User.findOne({
        $or: [
          { email: usernameOrEmail.toLowerCase() },
          { username: usernameOrEmail.toLowerCase() }
        ]
      }).select('+password');

      if (!user) {
        throw new UnauthorizedError('Invalid credentials');
      }

      // Check if account is locked
      if (user.isAccountLocked()) {
        throw new UnauthorizedError('Account is locked. Please try again later');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        user.incLoginAttempts();
        await user.save();
        throw new UnauthorizedError('Invalid credentials');
      }

      // Reset login attempts
      user.resetLoginAttempts();
      await user.save();

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      logger.logAuth('login', user._id.toString(), true);

      // Generate tokens
      const tokens = this.generateTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar
        }
      };
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(user: any): { accessToken: string; refreshToken: string } {
    const jwtAccessSecret = config.jwtAccessSecret as string;
    const jwtRefreshSecret = config.jwtRefreshSecret as string;
    const jwtAccessExpiry = config.jwtAccessExpiry as string;
    const jwtRefreshExpiry = config.jwtRefreshExpiry as string;

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role
    };

    const accessToken = jwt.sign(payload, jwtAccessSecret, {
      expiresIn: jwtAccessExpiry as string
    } as SignOptions);

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      jwtRefreshSecret,
      {
        expiresIn: jwtRefreshExpiry as string
      } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      const jwtRefreshSecret = config.jwtRefreshSecret as string;
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const tokens = this.generateTokens(user);

      logger.info(`Token refreshed for user: ${user._id}`);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      logger.error('Token refresh error', error);
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string) {
    try {
      const user = await User.findById(userId);

      if (user) {
        user.lastLogout = new Date();
        await user.save();
      }

      logger.logAuth('logout', userId, true);

      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(email: string, activationCode: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (user.isVerified) {
        return { message: 'Email already verified' };
      }

      if (user.activationCode !== activationCode) {
        throw new UnauthorizedError('Invalid activation code');
      }

      if (user.activationExpire && user.activationExpire < new Date()) {
        throw new UnauthorizedError('Activation code has expired');
      }

      user.isVerified = true;
      user.activationCode = null as any;
      user.activationExpire = null as any;

      await user.save();

      logger.info(`Email verified for user: ${email}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if user exists
        return { message: 'If user exists, password reset link will be sent' };
      }

      // Generate reset token
      const jwtAccessSecret = config.jwtAccessSecret as string;

      const resetToken = jwt.sign(
        { userId: user._id.toString(), type: 'reset' },
        jwtAccessSecret,
        { expiresIn: '1h' } as SignOptions
      );

      user.resetToken = resetToken;
      user.resetExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.save();

      logger.info(`Password reset requested for: ${email}`);

      return { 
        message: 'Password reset link sent to email',
        resetToken // In production, send via email instead
      };
    } catch (error) {
      logger.error('Password reset request error', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.resetToken || user.resetToken !== token) {
        throw new UnauthorizedError('Invalid reset token');
      }

      if (user.resetExpire && user.resetExpire < new Date()) {
        throw new UnauthorizedError('Reset token has expired');
      }

      // Hash new password - Schema validation will handle password requirements
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;
      user.resetToken = null as any;
      user.resetExpire = null as any;

      await user.save();

      logger.info(`Password reset for user: ${email}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Password reset error', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);

      if (!isValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password - Schema validation will handle password requirements
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      user.password = hashedPassword;
      await user.save();

      logger.info(`Password changed for user: ${userId}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error', error);
      throw error;
    }
  }
}

export default AuthService;