import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services';
import { successResponse, paginatedResponse, createdResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Payment Controller - Handles payment processing endpoints
 */
export class PaymentController {
  /**
   * Create payment transaction
   * POST /api/payments
   */
  static async createPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId, paymentMethod } = req.body;

      if (!enrollmentId || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Enrollment ID and payment method are required'
        });
        return;
      }

      const payment = await PaymentService.createPayment(enrollmentId, paymentMethod);

      res.status(201).json(createdResponse(payment, 'Payment created successfully'));
    } catch (error) {
      logger.error('Create payment controller error', error);
      next(error);
    }
  }

  /**
   * Get payment by ID
   * GET /api/payments/:id
   */
  static async getPaymentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const payment = await PaymentService.getPaymentById(id);

      res.status(200).json(successResponse(payment));
    } catch (error) {
      logger.error('Get payment controller error', error);
      next(error);
    }
  }

  /**
   * Get payments by enrollment
   * GET /api/payments/enrollment/:enrollmentId
   */
  static async getPaymentsByEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId } = req.params;

      const payments = await PaymentService.getPaymentsByEnrollment(enrollmentId);

      res.status(200).json(successResponse(payments));
    } catch (error) {
      logger.error('Get payments by enrollment controller error', error);
      next(error);
    }
  }

  /**
   * Get student payments
   * GET /api/payments/student/:studentId
   */
  static async getStudentPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PaymentService.getStudentPayments(studentId, page, limit);

      res.status(200).json(paginatedResponse(result.payments, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get student payments controller error', error);
      next(error);
    }
  }

  /**
   * Update payment status
   * PATCH /api/payments/:id/status
   */
  static async updatePaymentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, transactionId } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required'
        });
        return;
      }

      const payment = await PaymentService.updatePaymentStatus(id, status, transactionId);

      res.status(200).json(successResponse(payment, 'Payment status updated'));
    } catch (error) {
      logger.error('Update payment status controller error', error);
      next(error);
    }
  }

  /**
   * Get payment analytics
   * GET /api/payments/analytics
   */
  static async getPaymentAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const analytics = await PaymentService.getPaymentAnalytics(startDate, endDate);

      res.status(200).json(successResponse(analytics));
    } catch (error) {
      logger.error('Get payment analytics controller error', error);
      next(error);
    }
  }

  /**
   * Verify payment
   * GET /api/payments/verify/:transactionId
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionId } = req.params;

      const payment = await PaymentService.verifyPayment(transactionId);

      res.status(200).json(successResponse(payment));
    } catch (error) {
      logger.error('Verify payment controller error', error);
      next(error);
    }
  }

  /**
   * Get my payments (current user)
   * GET /api/payments/my
   */
  static async getMyPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req as any).user?.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PaymentService.getStudentPayments(studentId, page, limit);

      res.status(200).json(paginatedResponse(result.payments, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get my payments controller error', error);
      next(error);
    }
  }
}

export default PaymentController;