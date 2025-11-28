import { Router } from 'express';
import { PaymentController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * Payment Routes
 * Base: /api/payments
 */

// Protected routes
router.post('/', authenticate, PaymentController.createPayment);
router.get('/my', authenticate, PaymentController.getMyPayments);
router.get('/:id', authenticate, PaymentController.getPaymentById);
router.get('/enrollment/:enrollmentId', authenticate, PaymentController.getPaymentsByEnrollment);
router.get('/student/:studentId', authenticate, PaymentController.getStudentPayments);
router.get('/verify/:transactionId', PaymentController.verifyPayment);
router.patch('/:id/status', authenticate, PaymentController.updatePaymentStatus);

// Admin only routes
router.get('/analytics', authenticate, authorize(['admin']), PaymentController.getPaymentAnalytics);

export default router;