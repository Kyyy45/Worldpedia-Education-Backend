import { Help } from '../models';
import { NotFoundError, ForbiddenError, ValidationError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Help Service - Handles help/FAQ management
 */
export class HelpService {
  /**
   * Create help article
   */
  static async createHelpArticle(helpData: any, createdBy: string) {
    try {
      const { question, answer, category, keywords } = helpData;

      if (!question || !answer || !category) {
        throw new ValidationError('Missing required fields', {
          question: !question ? 'Question is required' : '',
          answer: !answer ? 'Answer is required' : '',
          category: !category ? 'Category is required' : ''
        });
      }

      const help = new Help({
        question,
        answer,
        category,
        keywords: keywords || [],
        createdBy,
        isActive: true,
        views: 0,
        helpful: 0,
        notHelpful: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await help.save();

      logger.info(`Help article created: ${help._id}`);

      return help;
    } catch (error) {
      logger.error('Create help article error', error);
      throw error;
    }
  }

  /**
   * Get help article by ID
   */
  static async getHelpArticleById(helpId: string) {
    try {
      const help = await Help.findByIdAndUpdate(
        helpId,
        { $inc: { views: 1 } },
        { new: true }
      ).populate('createdBy', 'fullName');

      if (!help) {
        throw new NotFoundError('Help article not found');
      }

      return help;
    } catch (error) {
      logger.error('Get help article error', error);
      throw error;
    }
  }

  /**
   * Search help articles by keywords
   */
  static async searchByKeywords(query: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const searchQuery = {
        isActive: true,
        $or: [
          { question: { $regex: query, $options: 'i' } },
          { answer: { $regex: query, $options: 'i' } },
          { keywords: { $in: [new RegExp(query, 'i')] } }
        ]
      };

      const total = await Help.countDocuments(searchQuery);
      const articles = await Help.find(searchQuery)
        .select('-answer')
        .skip(skip)
        .limit(limit)
        .sort({ views: -1 });

      return {
        articles,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Search help articles error', error);
      throw error;
    }
  }

  /**
   * Get help articles by category
   */
  static async getByCategory(category: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const validCategories = ['account', 'course', 'enrollment', 'payment', 'certificate', 'technical', 'other'];
      if (!validCategories.includes(category)) {
        throw new ValidationError('Invalid category', { category: `Category must be one of: ${validCategories.join(', ')}` });
      }

      const total = await Help.countDocuments({ category, isActive: true });
      const articles = await Help.find({ category, isActive: true })
        .skip(skip)
        .limit(limit)
        .sort({ views: -1 });

      return {
        articles,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get help by category error', error);
      throw error;
    }
  }

  /**
   * Update help article
   */
  static async updateHelpArticle(helpId: string, updateData: any, userId: string) {
    try {
      const help = await Help.findById(helpId);

      if (!help) {
        throw new NotFoundError('Help article not found');
      }

      // Check authorization - only creator or admin can update
      if (help.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to update this article');
      }

      Object.assign(help, updateData);
      help.updatedAt = new Date();

      await help.save();

      logger.info(`Help article updated: ${helpId}`);

      return help;
    } catch (error) {
      logger.error('Update help article error', error);
      throw error;
    }
  }

  /**
   * Delete help article
   */
  static async deleteHelpArticle(helpId: string, userId: string) {
    try {
      const help = await Help.findById(helpId);

      if (!help) {
        throw new NotFoundError('Help article not found');
      }

      // Check authorization
      if (help.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to delete this article');
      }

      await Help.deleteOne({ _id: helpId });

      logger.info(`Help article deleted: ${helpId}`);

      return { message: 'Help article deleted successfully' };
    } catch (error) {
      logger.error('Delete help article error', error);
      throw error;
    }
  }

  /**
   * Mark as helpful
   */
  static async markAsHelpful(helpId: string) {
    try {
      const help = await Help.findByIdAndUpdate(
        helpId,
        { $inc: { helpful: 1 } },
        { new: true }
      );

      if (!help) {
        throw new NotFoundError('Help article not found');
      }

      return help;
    } catch (error) {
      logger.error('Mark as helpful error', error);
      throw error;
    }
  }

  /**
   * Mark as not helpful
   */
  static async markAsNotHelpful(helpId: string) {
    try {
      const help = await Help.findByIdAndUpdate(
        helpId,
        { $inc: { notHelpful: 1 } },
        { new: true }
      );

      if (!help) {
        throw new NotFoundError('Help article not found');
      }

      return help;
    } catch (error) {
      logger.error('Mark as not helpful error', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  static async getCategories() {
    try {
      const categories = await Help.distinct('category', { isActive: true });

      const categoryStats = await Promise.all(
        categories.map(async (cat) => ({
          category: cat,
          count: await Help.countDocuments({ category: cat, isActive: true })
        }))
      );

      return categoryStats.sort((a, b) => b.count - a.count);
    } catch (error) {
      logger.error('Get categories error', error);
      throw error;
    }
  }

  /**
   * Get help statistics
   */
  static async getHelpStats() {
    try {
      const totalArticles = await Help.countDocuments({ isActive: true });
      const articles = await Help.find({ isActive: true });

      const totalViews = articles.reduce((sum, a) => sum + a.views, 0);
      const totalHelpful = articles.reduce((sum, a) => sum + a.helpful, 0);
      const totalNotHelpful = articles.reduce((sum, a) => sum + a.notHelpful, 0);

      const helpfulRate = totalHelpful + totalNotHelpful > 0
        ? ((totalHelpful / (totalHelpful + totalNotHelpful)) * 100).toFixed(2)
        : 0;

      return {
        totalArticles,
        totalViews,
        totalHelpful,
        totalNotHelpful,
        helpfulRate,
        avgViewsPerArticle: Math.round(totalViews / totalArticles)
      };
    } catch (error) {
      logger.error('Get help stats error', error);
      throw error;
    }
  }
}

export default HelpService;