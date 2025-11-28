import { Router } from 'express';
import { FormController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Form Routes
 * Base: /api/forms
 */

// Public routes
router.get('/course/:courseId', FormController.getFormsByCourse);

// Protected routes
router.post('/', authenticate, FormController.createForm);
router.get('/:id', authenticate, FormController.getFormById);
router.get('/:id/submissions', authenticate, FormController.getFormSubmissions);
router.get('/:id/my-submission', authenticate, FormController.getStudentSubmission);
router.get('/:id/analytics', authenticate, FormController.getFormAnalytics);
router.post('/:id/submit', authenticate, FormController.submitForm);
router.put('/:id', authenticate, FormController.updateForm);
router.delete('/:id', authenticate, FormController.deleteForm);

export default router;