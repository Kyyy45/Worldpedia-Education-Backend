import { logger } from '../utils/logger';
import { Payment } from '../models'; // Menggunakan Payment Model dari MongoDB
import {
  TransactionData,
  InvoiceData,
  PaymentStatus,
  PaymentHistory,
  PaymentStatistics
} from '../types/payment.types';
import { generateInvoiceHTML, generateInvoiceText } from '../utils/invoice-generator';

export class TransactionService {
  /**
   * Get transaction by ID (from Database)
   */
  async getTransaction(transactionId: string): Promise<TransactionData | null> {
    try {
      const payment = await Payment.findOne({ 
        $or: [{ transactionId }, { orderId: transactionId }] 
      });
      
      if (!payment) return null;

      // Mapping dari Payment Document ke TransactionData Interface
      return {
        transactionId: payment.transactionId,
        orderId: payment.orderId,
        userId: payment.userId.toString(),
        amount: payment.amount,
        status: payment.status as PaymentStatus,
        paymentMethod: payment.paymentMethod,
        snapToken: payment.midtransToken,
        redirectUrl: payment.redirectUrl,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt || undefined,
        expiresAt: new Date(payment.createdAt.getTime() + 24 * 60 * 60 * 1000) // Asumsi expire 24 jam
      };
    } catch (error: any) {
      logger.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Get user's transactions (from Database)
   */
  async getUserTransactions(userId: string, limit: number = 50): Promise<PaymentHistory[]> {
    try {
      const payments = await Payment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);

      return payments.map((p) => ({
        transactionId: p.transactionId,
        orderId: p.orderId,
        amount: p.amount,
        status: p.status as PaymentStatus,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
        paidAt: p.paidAt || undefined
      }));
    } catch (error: any) {
      logger.error('Failed to get user transactions:', error);
      throw error;
    }
  }

  /**
   * Get transactions by status (Admin feature - from Database)
   */
  async getTransactionsByStatus(status: PaymentStatus, limit: number = 50): Promise<PaymentHistory[]> {
    try {
      const payments = await Payment.find({ status })
        .sort({ createdAt: -1 })
        .limit(limit);

      return payments.map((p) => ({
        transactionId: p.transactionId,
        orderId: p.orderId,
        amount: p.amount,
        status: p.status as PaymentStatus,
        paymentMethod: p.paymentMethod,
        createdAt: p.createdAt,
        paidAt: p.paidAt || undefined
      }));
    } catch (error: any) {
      logger.error('Failed to get transactions by status:', error);
      throw error;
    }
  }

  /**
   * Get invoice data (Dynamically generated from Payment Data)
   * Note: Karena Payment model standar tidak menyimpan detail item secara mendalam,
   * kita membuat invoice generik berdasarkan data enrollment/payment.
   */
  async getInvoice(invoiceId: string): Promise<InvoiceData | null> {
    try {
      // Cari payment berdasarkan transactionId atau orderId (invoiceId dianggap salah satu dari ini)
      const payment = await Payment.findOne({ 
        $or: [{ transactionId: invoiceId }, { orderId: invoiceId }] 
      }).populate('userId', 'fullName email');

      if (!payment) return null;

      const user = payment.userId as any; // Type casting karena populate

      return {
        invoiceId: payment.transactionId, // Menggunakan Transaction ID sebagai No Invoice
        transactionId: payment.transactionId,
        orderId: payment.orderId,
        customerId: user._id.toString(),
        customerName: user.fullName || 'Unknown Customer',
        customerEmail: user.email || 'No Email',
        items: [{ 
          id: '1', 
          name: 'Course Enrollment Fee', 
          price: payment.amount, 
          quantity: 1, 
          subtotal: payment.amount 
        }],
        subtotal: payment.amount,
        discount: 0,
        tax: 0,
        total: payment.amount,
        status: payment.status as PaymentStatus,
        paymentMethod: payment.paymentMethod as any,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt || undefined,
        notes: payment.failureReason ? `Failed: ${payment.failureReason}` : undefined
      };
    } catch (error: any) {
      logger.error('Error fetching invoice data:', error);
      return null;
    }
  }

  /**
   * Get invoice as HTML
   */
  async getInvoiceHTML(invoiceId: string): Promise<string | null> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return null;

    return generateInvoiceHTML(invoice);
  }

  /**
   * Get invoice as plain text
   */
  async getInvoiceText(invoiceId: string): Promise<string | null> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) return null;

    return generateInvoiceText(invoice);
  }

  /**
   * Get payment statistics (Aggregated from Database)
   */
  async getStatistics(): Promise<PaymentStatistics> {
    try {
      const stats = await Payment.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            successfulTransactions: {
              $sum: {
                $cond: [
                  { $or: [{ $eq: ['$status', 'settlement'] }, { $eq: ['$status', 'capture'] }] },
                  1,
                  0
                ]
              }
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            failedTransactions: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['deny', 'cancel', 'expire', 'failed']] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      const result = stats[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0
      };

      const averageTransactionAmount = result.totalTransactions > 0 
        ? result.totalRevenue / result.totalTransactions 
        : 0;
        
      const successRate = result.totalTransactions > 0 
        ? (result.successfulTransactions / result.totalTransactions) * 100 
        : 0;

      return {
        ...result,
        averageTransactionAmount,
        successRate
      };
    } catch (error: any) {
      logger.error('Failed to get statistics:', error);
      throw error;
    }
  }
}

export default new TransactionService();