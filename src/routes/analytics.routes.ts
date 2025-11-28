import { Router } from 'express';
import { AnalyticsController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * Analytics Routes
 * Base: /api/analytics
 * All routes require authentication and admin role
 */

// Dashboard analytics
router.get('/dashboard', authenticate, authorize(['admin']), AnalyticsController.getDashboardAnalytics);

// Course analytics
router.get('/courses/:courseId', authenticate, authorize(['admin']), AnalyticsController.getCourseAnalytics);

// Enrollment trends
router.get('/enrollments/trends', authenticate, authorize(['admin']), AnalyticsController.getEnrollmentTrends);

// Revenue analytics
router.get('/revenue/trends', authenticate, authorize(['admin']), AnalyticsController.getRevenueTrends);

// Course rankings
router.get('/courses/top', authenticate, authorize(['admin']), AnalyticsController.getTopCourses);

// Progress distribution
router.get('/progress/distribution', authenticate, authorize(['admin']), AnalyticsController.getProgressDistribution);

// Payment methods
router.get('/payments/methods', authenticate, authorize(['admin']), AnalyticsController.getPaymentMethodsBreakdown);

// Level distribution
router.get('/levels/distribution', authenticate, authorize(['admin']), AnalyticsController.getLevelDistribution);

// Export analytics
router.post('/export', authenticate, authorize(['admin']), AnalyticsController.exportAnalytics);

export default router;