import { Request, Response, NextFunction } from 'express';
import { FormService } from '../services';
import { successResponse, paginatedResponse, createdResponse, deletedResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Form Controller - Handles form creation and submission endpoints
 */
export class FormController {
  /**
   * Create form
   * POST /api/forms
   */
  static async createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const formData = { ...req.body, createdBy: userId };

      const form = await FormService.createForm(formData, userId);

      res.status(201).json(createdResponse(form, 'Form created successfully'));
    } catch (error) {
      logger.error('Create form controller error', error);
      next(error);
    }
  }

  /**
   * Get form by ID
   * GET /api/forms/:id
   */
  static async getFormById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const form = await FormService.getFormById(id);

      res.status(200).json(successResponse(form));
    } catch (error) {
      logger.error('Get form controller error', error);
      next(error);
    }
  }

  /**
   * Get forms by course
   * GET /api/forms/course/:courseId
   */
  static async getFormsByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;

      const forms = await FormService.getFormsByCourse(courseId);

      res.status(200).json(successResponse(forms));
    } catch (error) {
      logger.error('Get forms by course controller error', error);
      next(error);
    }
  }

  /**
   * Update form
   * PUT /api/forms/:id
   */
  static async updateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const form = await FormService.updateForm(id, req.body, userId);

      res.status(200).json(successResponse(form, 'Form updated successfully'));
    } catch (error) {
      logger.error('Update form controller error', error);
      next(error);
    }
  }

  /**
   * Delete form
   * DELETE /api/forms/:id
   */
  static async deleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const result = await FormService.deleteForm(id, userId);

      res.status(200).json(deletedResponse(result.message));
    } catch (error) {
      logger.error('Delete form controller error', error);
      next(error);
    }
  }

  /**
   * Submit form
   * POST /api/forms/:id/submit
   */
  static async submitForm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = (req as any).user?.userId;
      const { responses } = req.body;

      if (!responses) {
        res.status(400).json({
          success: false,
          error: 'Form responses are required'
        });
        return;
      }

      const submission = await FormService.submitForm(id, studentId, responses);

      res.status(201).json(createdResponse(submission, 'Form submitted successfully'));
    } catch (error) {
      logger.error('Submit form controller error', error);
      next(error);
    }
  }

  /**
   * Get form submissions
   * GET /api/forms/:id/submissions
   */
  static async getFormSubmissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await FormService.getFormSubmissions(id, page, limit);

      res.status(200).json(paginatedResponse(result.submissions, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get form submissions controller error', error);
      next(error);
    }
  }

  /**
   * Get student submission
   * GET /api/forms/:id/my-submission
   */
  static async getStudentSubmission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = (req as any).user?.userId;

      const submission = await FormService.getStudentSubmission(id, studentId);

      res.status(200).json(successResponse(submission));
    } catch (error) {
      logger.error('Get student submission controller error', error);
      next(error);
    }
  }

  /**
   * Get form analytics
   * GET /api/forms/:id/analytics
   */
  static async getFormAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const analytics = await FormService.getFormAnalytics(id);

      res.status(200).json(successResponse(analytics));
    } catch (error) {
      logger.error('Get form analytics controller error', error);
      next(error);
    }
  }
}

export default FormController;