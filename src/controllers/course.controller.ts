import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services';
import { successResponse, paginatedResponse, createdResponse, deletedResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Course Controller - Handles course management endpoints
 */
export class CourseController {
  /**
   * Create new course
   * POST /api/courses
   */
  static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const courseData = { ...req.body, createdBy: userId };

      const course = await CourseService.createCourse(courseData);

      res.status(201).json(createdResponse(course, 'Course created successfully'));
    } catch (error) {
      logger.error('Create course controller error', error);
      next(error);
    }
  }

  /**
   * Get course by ID
   * GET /api/courses/:id
   */
  static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const course = await CourseService.getCourseById(id);

      res.status(200).json(successResponse(course));
    } catch (error) {
      logger.error('Get course controller error', error);
      next(error);
    }
  }

  /**
   * Get all courses with pagination
   * GET /api/courses
   */
  static async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filters = {
        level: req.query.level,
        search: req.query.search,
        minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined
      };

      const result = await CourseService.getAllCourses(page, limit, filters);

      res.status(200).json(paginatedResponse(result.courses, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get all courses controller error', error);
      next(error);
    }
  }

  /**
   * Update course
   * PUT /api/courses/:id
   */
  static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const course = await CourseService.updateCourse(id, req.body, userId);

      res.status(200).json(successResponse(course, 'Course updated successfully'));
    } catch (error) {
      logger.error('Update course controller error', error);
      next(error);
    }
  }

  /**
   * Delete course
   * DELETE /api/courses/:id
   */
  static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const result = await CourseService.deleteCourse(id, userId);

      res.status(200).json(deletedResponse(result.message));
    } catch (error) {
      logger.error('Delete course controller error', error);
      next(error);
    }
  }

  /**
   * Get course enrollments
   * GET /api/courses/:id/enrollments
   */
  static async getCourseEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CourseService.getCourseEnrollments(id, page, limit);

      res.status(200).json(paginatedResponse(result.enrollments, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get course enrollments controller error', error);
      next(error);
    }
  }

  /**
   * Get course statistics
   * GET /api/courses/:id/stats
   */
  static async getCourseStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const stats = await CourseService.getCourseStats(id);

      res.status(200).json(successResponse(stats));
    } catch (error) {
      logger.error('Get course stats controller error', error);
      next(error);
    }
  }

  /**
   * Search courses
   * GET /api/courses/search
   */
  static async searchCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await CourseService.searchCourses(query, page, limit);

      res.status(200).json(paginatedResponse(result.courses, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Search courses controller error', error);
      next(error);
    }
  }
}

export default CourseController;