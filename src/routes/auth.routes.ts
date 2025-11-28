import { Router } from 'express';
import { AuthController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Auth Routes
 * Base: /api/auth
 */

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;