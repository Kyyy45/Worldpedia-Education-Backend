import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services';
import { successResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Analytics Controller - Handles dashboard analytics endpoints
 */
export class AnalyticsController {
  /**
   * Get overall dashboard analytics
   * GET /api/analytics/dashboard
   */
  static async getDashboardAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const analytics = await AnalyticsService.getDashboardAnalytics(startDate, endDate);

      res.status(200).json(successResponse(analytics));
    } catch (error) {
      logger.error('Get dashboard analytics controller error', error);
      next(error);
    }
  }

  /**
   * Get course-specific analytics
   * GET /api/analytics/courses/:courseId
   */
  static async getCourseAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;

      const analytics = await AnalyticsService.getCourseAnalytics(courseId);

      res.status(200).json(successResponse(analytics));
    } catch (error) {
      logger.error('Get course analytics controller error', error);
      next(error);
    }
  }

  /**
   * Get enrollment trends
   * GET /api/analytics/enrollments/trends
   */
  static async getEnrollmentTrends(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(_req.query.days as string) || 30;

      const trends = await AnalyticsService.getEnrollmentTrends(days);

      res.status(200).json(successResponse(trends));
    } catch (error) {
      logger.error('Get enrollment trends controller error', error);
      next(error);
    }
  }

  /**
   * Get revenue trends
   * GET /api/analytics/revenue/trends
   */
  static async getRevenueTrends(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(_req.query.days as string) || 30;

      const trends = await AnalyticsService.getRevenueTrends(days);

      res.status(200).json(successResponse(trends));
    } catch (error) {
      logger.error('Get revenue trends controller error', error);
      next(error);
    }
  }

  /**
   * Get top courses by enrollment
   * GET /api/analytics/courses/top
   */
  static async getTopCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(_req.query.limit as string) || 10;

      const courses = await AnalyticsService.getTopCourses(limit);

      res.status(200).json(successResponse(courses));
    } catch (error) {
      logger.error('Get top courses controller error', error);
      next(error);
    }
  }

  /**
   * Get student progress distribution
   * GET /api/analytics/progress/distribution
   */
  static async getProgressDistribution(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const distribution = await AnalyticsService.getProgressDistribution();

      res.status(200).json(successResponse(distribution));
    } catch (error) {
      logger.error('Get progress distribution controller error', error);
      next(error);
    }
  }

  /**
   * Get payment methods breakdown
   * GET /api/analytics/payments/methods
   */
  static async getPaymentMethodsBreakdown(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const breakdown = await AnalyticsService.getPaymentMethodsBreakdown();

      res.status(200).json(successResponse(breakdown));
    } catch (error) {
      logger.error('Get payment methods breakdown controller error', error);
      next(error);
    }
  }

  /**
   * Get level-wise enrollment distribution
   * GET /api/analytics/levels/distribution
   */
  static async getLevelDistribution(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const distribution = await AnalyticsService.getLevelDistribution();

      res.status(200).json(successResponse(distribution));
    } catch (error) {
      logger.error('Get level distribution controller error', error);
      next(error);
    }
  }

  /**
   * Export analytics
   * POST /api/analytics/export
   */
  static async exportAnalytics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await AnalyticsService.exportAnalytics();

      res.status(200).json(successResponse(analytics, 'Analytics exported successfully'));
    } catch (error) {
      logger.error('Export analytics controller error', error);
      next(error);
    }
  }
}

export default AnalyticsController;