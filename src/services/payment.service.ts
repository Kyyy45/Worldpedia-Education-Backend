import { Payment, Enrollment } from '../models';
import { NotFoundError, ConflictError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Payment Service - Handles payment processing
 */
export class PaymentService {
  /**
   * Create payment transaction
   */
  static async createPayment(enrollmentId: string, paymentMethod: string) {
    try {
      const enrollment = await Enrollment.findById(enrollmentId).populate('courseId');

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      const course = enrollment.courseId as any;

      // Check if already paid
      const existingPayment = await Payment.findOne({
        enrollmentId,
        status: 'completed'
      });

      if (existingPayment) {
        throw new ConflictError('Payment already completed for this enrollment');
      }

      const payment = new Payment({
        enrollmentId,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        amount: course.price,
        paymentMethod,
        status: 'pending',
        createdAt: new Date()
      });

      await payment.save();

      logger.logPayment('create', course.price, 'pending', { enrollmentId });

      return payment;
    } catch (error) {
      logger.error('Create payment error', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(paymentId: string) {
    try {
      const payment = await Payment.findById(paymentId)
        .populate('studentId', 'fullName email username')
        .populate('courseId', 'title price')
        .populate('enrollmentId', 'status progress');

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Get payment error', error);
      throw error;
    }
  }

  /**
   * Get payments by enrollment
   */
  static async getPaymentsByEnrollment(enrollmentId: string) {
    try {
      const payments = await Payment.find({ enrollmentId })
        .sort({ createdAt: -1 });

      return payments;
    } catch (error) {
      logger.error('Get payments by enrollment error', error);
      throw error;
    }
  }

  /**
   * Get student payments
   */
  static async getStudentPayments(studentId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const total = await Payment.countDocuments({ studentId });
      const payments = await Payment.find({ studentId })
        .populate('courseId', 'title price')
        .populate('enrollmentId', 'status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        payments,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get student payments error', error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(paymentId: string, status: string, transactionId?: string) {
    try {
      const payment = await Payment.findById(paymentId).populate('enrollmentId');

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid payment status');
      }

      payment.status = status as 'pending' | 'completed' | 'failed' | 'cancelled';
      if (transactionId) {
        payment.transactionId = transactionId;
      }

      if (status === 'completed') {
        payment.paidAt = new Date();

        // Update enrollment status to active
        const enrollment = await Enrollment.findById(payment.enrollmentId);
        if (enrollment) {
          enrollment.status = 'active';
          await enrollment.save();
        }
      }

      await payment.save();

      logger.logPayment('update', payment.amount, status, { paymentId });

      return payment;
    } catch (error) {
      logger.error('Update payment status error', error);
      throw error;
    }
  }

  /**
   * Get payment analytics
   */
  static async getPaymentAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      const payments = await Payment.find(query);

      const totalPayments = payments.length;
      const completedPayments = payments.filter(p => p.status === 'completed').length;
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      const avgTransactionValue = completedPayments > 0 ? totalRevenue / completedPayments : 0;

      const paymentsByMethod: any = {};
      payments.forEach(p => {
        if (!paymentsByMethod[p.paymentMethod]) {
          paymentsByMethod[p.paymentMethod] = 0;
        }
        paymentsByMethod[p.paymentMethod]++;
      });

      return {
        totalPayments,
        completedPayments,
        totalRevenue,
        avgTransactionValue: Math.round(avgTransactionValue),
        conversionRate: ((completedPayments / totalPayments) * 100).toFixed(2),
        paymentsByMethod
      };
    } catch (error) {
      logger.error('Get payment analytics error', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  static async verifyPayment(transactionId: string) {
    try {
      const payment = await Payment.findOne({ transactionId });

      if (!payment) {
        throw new NotFoundError('Payment not found');
      }

      return payment;
    } catch (error) {
      logger.error('Verify payment error', error);
      throw error;
    }
  }
}

export default PaymentService;