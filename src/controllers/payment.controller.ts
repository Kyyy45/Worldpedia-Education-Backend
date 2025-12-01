import { Request, Response } from 'express';
import paymentService from '../services/payment.service';
import transactionService from '../services/transaction.service';
import { logger } from '../utils/logger';
import { TransactionRequest, PaymentStatus } from '../types/payment.types';

export class PaymentController {
  /**
   * Create payment transaction
   */
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const request: TransactionRequest = req.body;
      const userId = (req.user as any)?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      request.userId = userId;

      const result = await paymentService.createTransaction(request);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Payment transaction created successfully'
      });
    } catch (error: any) {
      logger.error('Error creating transaction:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create transaction'
      });
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.body;

      if (!transactionId) {
        res.status(400).json({
          success: false,
          error: 'Transaction ID is required'
        });
        return;
      }

      const result = await paymentService.verifyPayment(transactionId);

      // Update transaction status
      if (result.status !== PaymentStatus.PENDING) {
        transactionService.updateTransactionStatus(transactionId, result.status);
      }

      res.status(200).json({
        success: true,
        data: result,
        message: 'Payment verified successfully'
      });
    } catch (error: any) {
      logger.error('Error verifying payment:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to verify payment'
      });
    }
  }

  /**
   * Get payment status by order ID
   */
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;

      // Find transaction by order ID (in real DB, use query)
      const transactions = Array.from(
        (transactionService as any).transactionStorage?.values?.() || []
      ) as any[];
      const transaction = transactions.find((t) => t.orderId === orderId);

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: transaction.orderId,
          status: transaction.status,
          amount: transaction.amount,
          createdAt: transaction.createdAt,
          paidAt: transaction.paidAt
        },
        message: 'Payment status retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error getting payment status:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payment status'
      });
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId } = req.body;

      await paymentService.cancelTransaction(transactionId);
      transactionService.updateTransactionStatus(transactionId, PaymentStatus.CANCEL);

      res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully'
      });
    } catch (error: any) {
      logger.error('Error cancelling payment:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to cancel payment'
      });
    }
  }

  /**
   * Process refund
   */
  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, amount, reason } = req.body;

      const result = await paymentService.refundTransaction(transactionId, amount, reason);
      transactionService.updateTransactionStatus(
        transactionId,
        amount ? PaymentStatus.PARTIAL_REFUND : PaymentStatus.REFUND
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Refund processed successfully'
      });
    } catch (error: any) {
      logger.error('Error processing refund:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to process refund'
      });
    }
  }

  /**
   * Handle webhook from Midtrans
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body;

      const result = await paymentService.processWebhook(payload);
      transactionService.updateTransactionStatus(payload.transaction_id, result.status);

      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error: any) {
      logger.error('Error processing webhook:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to process webhook'
      });
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req.user as any)?.userId;
      const { limit = 50 } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

      const history = transactionService.getUserTransactions(userId, parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: history,
        count: history.length,
        message: 'Payment history retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error getting payment history:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payment history'
      });
    }
  }

  /**
   * Get invoice
   */
  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { invoiceId } = req.params;
      const { format = 'html' } = req.query;

      const invoice = transactionService.getInvoice(invoiceId);

      if (!invoice) {
        res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
        return;
      }

      if (format === 'text') {
        const text = transactionService.getInvoiceText(invoiceId);
        res.setHeader('Content-Type', 'text/plain');
        res.send(text);
      } else if (format === 'pdf') {
        // TODO: Implement PDF generation
        res.status(501).json({
          success: false,
          error: 'PDF generation not yet implemented'
        });
      } else {
        const html = transactionService.getInvoiceHTML(invoiceId);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      }
    } catch (error: any) {
      logger.error('Error getting invoice:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get invoice'
      });
    }
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(_req: Request, res: Response): Promise<void> {
    try {
      const methods = paymentService.getAvailablePaymentMethods();

      res.status(200).json({
        success: true,
        data: methods,
        message: 'Payment methods retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error getting payment methods:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get payment methods'
      });
    }
  }

  /**
   * Get payment statistics (admin)
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const isAdmin = (req.user as any)?.role === 'admin';

      if (!isAdmin) {
        res.status(403).json({
          success: false,
          error: 'Admin access required'
        });
        return;
      }

      const stats = transactionService.getStatistics();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Payment statistics retrieved successfully'
      });
    } catch (error: any) {
      logger.error('Error getting statistics:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to get statistics'
      });
    }
  }
}

export default new PaymentController();