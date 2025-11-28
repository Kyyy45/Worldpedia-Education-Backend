import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services';
import { successResponse, paginatedResponse, createdResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Enrollment Controller - Handles course enrollment endpoints
 */
export class EnrollmentController {
  /**
   * Create enrollment
   * POST /api/enrollments
   */
  static async createEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req as any).user?.userId;
      const { courseId } = req.body;

      if (!courseId) {
        res.status(400).json({
          success: false,
          error: 'Course ID is required'
        });
        return;
      }

      const enrollment = await EnrollmentService.createEnrollment(studentId, courseId);

      res.status(201).json(createdResponse(enrollment, 'Enrollment created successfully'));
    } catch (error) {
      logger.error('Create enrollment controller error', error);
      next(error);
    }
  }

  /**
   * Get enrollment by ID
   * GET /api/enrollments/:id
   */
  static async getEnrollmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const enrollment = await EnrollmentService.getEnrollmentById(id);

      res.status(200).json(successResponse(enrollment));
    } catch (error) {
      logger.error('Get enrollment controller error', error);
      next(error);
    }
  }

  /**
   * Get student enrollments
   * GET /api/enrollments/student/:studentId
   */
  static async getStudentEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: req.query.status
      };

      const result = await EnrollmentService.getStudentEnrollments(studentId, page, limit, filters);

      res.status(200).json(paginatedResponse(result.enrollments, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get student enrollments controller error', error);
      next(error);
    }
  }

  /**
   * Update enrollment status
   * PATCH /api/enrollments/:id/status
   */
  static async updateEnrollmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        });
        return;
      }

      const enrollment = await EnrollmentService.updateEnrollmentStatus(id, status);

      res.status(200).json(successResponse(enrollment, 'Enrollment status updated'));
    } catch (error) {
      logger.error('Update enrollment status controller error', error);
      next(error);
    }
  }

  /**
   * Update enrollment progress
   * PATCH /api/enrollments/:id/progress
   */
  static async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      if (progress === undefined || progress === null) {
        res.status(400).json({
          success: false,
          error: 'Progress is required'
        });
        return;
      }

      const enrollment = await EnrollmentService.updateProgress(id, progress);

      res.status(200).json(successResponse(enrollment, 'Progress updated'));
    } catch (error) {
      logger.error('Update progress controller error', error);
      next(error);
    }
  }

  /**
   * Cancel enrollment
   * DELETE /api/enrollments/:id
   */
  static async cancelEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = (req as any).user?.userId;

      const enrollment = await EnrollmentService.cancelEnrollment(id, studentId);

      res.status(200).json(successResponse(enrollment, 'Enrollment cancelled'));
    } catch (error) {
      logger.error('Cancel enrollment controller error', error);
      next(error);
    }
  }

  /**
   * Get progress summary
   * GET /api/enrollments/summary/:studentId
   */
  static async getProgressSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;

      const summary = await EnrollmentService.getProgressSummary(studentId);

      res.status(200).json(successResponse(summary));
    } catch (error) {
      logger.error('Get progress summary controller error', error);
      next(error);
    }
  }

  /**
   * Get my enrollments (current user)
   * GET /api/enrollments/my
   */
  static async getMyEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req as any).user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        status: req.query.status
      };

      const result = await EnrollmentService.getStudentEnrollments(studentId, page, limit, filters);

      res.status(200).json(paginatedResponse(result.enrollments, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get my enrollments controller error', error);
      next(error);
    }
  }
}

export default EnrollmentController;