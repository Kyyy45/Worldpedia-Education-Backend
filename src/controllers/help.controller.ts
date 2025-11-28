import { Request, Response, NextFunction } from 'express';
import { HelpService } from '../services';
import { successResponse, paginatedResponse, createdResponse, deletedResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Help Controller - Handles help/FAQ endpoints
 */
export class HelpController {
  /**
   * Create help article
   * POST /api/help
   */
  static async createHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { question, answer, category } = req.body;

      if (!question || !answer || !category) {
        res.status(400).json({
          success: false,
          error: 'Question, answer, and category are required'
        });
        return;
      }

      const help = await HelpService.createHelpArticle(req.body, userId);

      res.status(201).json(createdResponse(help, 'Help article created successfully'));
    } catch (error) {
      logger.error('Create help article controller error', error);
      next(error);
    }
  }

  /**
   * Get help article by ID
   * GET /api/help/:id
   */
  static async getHelpArticleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const help = await HelpService.getHelpArticleById(id);

      res.status(200).json(successResponse(help));
    } catch (error) {
      logger.error('Get help article controller error', error);
      next(error);
    }
  }

  /**
   * Search help articles by keywords
   * GET /api/help/search
   */
  static async searchByKeywords(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const result = await HelpService.searchByKeywords(query, page, limit);

      res.status(200).json(paginatedResponse(result.articles, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Search help articles controller error', error);
      next(error);
    }
  }

  /**
   * Get help articles by category
   * GET /api/help/category/:category
   */
  static async getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await HelpService.getByCategory(category, page, limit);

      res.status(200).json(paginatedResponse(result.articles, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get help by category controller error', error);
      next(error);
    }
  }

  /**
   * Update help article
   * PUT /api/help/:id
   */
  static async updateHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const help = await HelpService.updateHelpArticle(id, req.body, userId);

      res.status(200).json(successResponse(help, 'Help article updated successfully'));
    } catch (error) {
      logger.error('Update help article controller error', error);
      next(error);
    }
  }

  /**
   * Delete help article
   * DELETE /api/help/:id
   */
  static async deleteHelpArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const result = await HelpService.deleteHelpArticle(id, userId);

      res.status(200).json(deletedResponse(result.message));
    } catch (error) {
      logger.error('Delete help article controller error', error);
      next(error);
    }
  }

  /**
   * Mark as helpful
   * POST /api/help/:id/helpful
   */
  static async markAsHelpful(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const help = await HelpService.markAsHelpful(id);

      res.status(200).json(successResponse(help));
    } catch (error) {
      logger.error('Mark as helpful controller error', error);
      next(error);
    }
  }

  /**
   * Mark as not helpful
   * POST /api/help/:id/not-helpful
   */
  static async markAsNotHelpful(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const help = await HelpService.markAsNotHelpful(id);

      res.status(200).json(successResponse(help));
    } catch (error) {
      logger.error('Mark as not helpful controller error', error);
      next(error);
    }
  }

  /**
   * Get all categories
   * GET /api/help/categories
   */
  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await HelpService.getCategories();

      res.status(200).json(successResponse(categories));
    } catch (error) {
      logger.error('Get categories controller error', error);
      next(error);
    }
  }

  /**
   * Get help statistics
   * GET /api/help/stats
   */
  static async getHelpStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await HelpService.getHelpStats();

      res.status(200).json(successResponse(stats));
    } catch (error) {
      logger.error('Get help stats controller error', error);
      next(error);
    }
  }
}

export default HelpController;