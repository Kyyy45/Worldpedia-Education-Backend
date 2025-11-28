import { Router } from 'express';
import { HelpController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * Help Routes
 * Base: /api/help
 */

// Public routes
router.get('/', HelpController.getCategories);
router.get('/stats', HelpController.getHelpStats);
router.get('/search', HelpController.searchByKeywords);
router.get('/category/:category', HelpController.getByCategory);
router.get('/:id', HelpController.getHelpArticleById);
router.post('/:id/helpful', HelpController.markAsHelpful);
router.post('/:id/not-helpful', HelpController.markAsNotHelpful);

// Protected routes - Admin/Creator only
router.post('/', authenticate, authorize(['admin']), HelpController.createHelpArticle);
router.put('/:id', authenticate, authorize(['admin']), HelpController.updateHelpArticle);
router.delete('/:id', authenticate, authorize(['admin']), HelpController.deleteHelpArticle);

export default router;