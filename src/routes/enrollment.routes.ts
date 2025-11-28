import { Router } from 'express';
import { EnrollmentController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Enrollment Routes
 * Base: /api/enrollments
 */

// Protected routes - all require authentication
router.post('/', authenticate, EnrollmentController.createEnrollment);
router.get('/my', authenticate, EnrollmentController.getMyEnrollments);
router.get('/:id', authenticate, EnrollmentController.getEnrollmentById);
router.get('/student/:studentId', authenticate, EnrollmentController.getStudentEnrollments);
router.get('/summary/:studentId', authenticate, EnrollmentController.getProgressSummary);
router.patch('/:id/status', authenticate, EnrollmentController.updateEnrollmentStatus);
router.patch('/:id/progress', authenticate, EnrollmentController.updateProgress);
router.delete('/:id', authenticate, EnrollmentController.cancelEnrollment);

export default router;