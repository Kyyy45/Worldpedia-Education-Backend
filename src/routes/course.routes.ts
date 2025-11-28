import { Router } from 'express';
import { CourseController } from '../controllers';
import { authenticate } from '../middleware';

const router = Router();

/**
 * Course Routes
 * Base: /api/courses
 */

// Public routes
router.get('/', CourseController.getAllCourses);
router.get('/search', CourseController.searchCourses);
router.get('/:id', CourseController.getCourseById);
router.get('/:id/stats', CourseController.getCourseStats);
router.get('/:id/enrollments', CourseController.getCourseEnrollments);

// Protected routes - Create (authenticated users)
router.post('/', authenticate, CourseController.createCourse);

// Protected routes - Update/Delete (course creator or admin)
router.put('/:id', authenticate, CourseController.updateCourse);
router.delete('/:id', authenticate, CourseController.deleteCourse);

export default router;