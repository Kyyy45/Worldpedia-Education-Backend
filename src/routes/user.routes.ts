import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * User Routes
 * Base: /api/users
 */

// Public routes - search users (basic info only)
router.get('/search', UserController.searchUsers);
router.get('/:username', UserController.getUserByUsername);

// Protected routes
router.get('/me', authenticate, UserController.getMyProfile);
router.get('/profile', authenticate, UserController.getUserProfile);
router.put('/profile', authenticate, UserController.updateUserProfile);
router.get('/:id/stats', authenticate, UserController.getUserStats);
router.get('/:id/activity', authenticate, UserController.getUserActivityLog);
router.delete('/:id', authenticate, UserController.deleteUserAccount);

// Admin only routes
router.get('/', authenticate, authorize(['admin']), UserController.getAllUsers);
router.patch('/:id/role', authenticate, authorize(['admin']), UserController.updateUserRole);
router.patch('/:id/lock', authenticate, authorize(['admin']), UserController.lockUserAccount);
router.patch('/:id/unlock', authenticate, authorize(['admin']), UserController.unlockUserAccount);
router.patch('/bulk', authenticate, authorize(['admin']), UserController.bulkUpdateUsers);

export default router;