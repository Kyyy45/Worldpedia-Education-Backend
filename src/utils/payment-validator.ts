import { createHash } from 'crypto';
import { logger } from './logger';
import { PaymentStatus, TransactionRequest } from '../types/payment.types';

/**
 * Validate transaction amount
 * Min: 1000 IDR, Max: 999,999,999 IDR
 */
export const validateAmount = (amount: number): { valid: boolean; error?: string } => {
  if (!amount || typeof amount !== 'number') {
    return { valid: false, error: 'Amount must be a number' };
  }

  if (amount < 1000) {
    return { valid: false, error: 'Minimum amount is 1000 IDR' };
  }

  if (amount > 999999999) {
    return { valid: false, error: 'Maximum amount is 999999999 IDR' };
  }

  return { valid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Accept +62, 0, or without country code
  const phoneRegex = /^(\+62|0|62)?[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

/**
 * Comprehensive transaction request validation
 */
export const validateTransactionRequest = (
  request: TransactionRequest
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate amount
  const amountValidation = validateAmount(request.amount);
  if (!amountValidation.valid) {
    errors.push(amountValidation.error || 'Invalid amount');
  }

  // Validate order ID
  if (!request.orderId || typeof request.orderId !== 'string') {
    errors.push('Order ID is required');
  }

  // Validate user ID
  if (!request.userId || typeof request.userId !== 'string') {
    errors.push('User ID is required');
  }

  // Validate customer details
  if (!request.customerDetails) {
    errors.push('Customer details are required');
  } else {
    if (!request.customerDetails.firstName) {
      errors.push('Customer first name is required');
    }
    if (!request.customerDetails.lastName) {
      errors.push('Customer last name is required');
    }
    if (!request.customerDetails.email || !validateEmail(request.customerDetails.email)) {
      errors.push('Valid customer email is required');
    }
    if (!request.customerDetails.phone || !validatePhoneNumber(request.customerDetails.phone)) {
      errors.push('Valid customer phone number is required');
    }
  }

  // Validate items
  if (!request.items || !Array.isArray(request.items) || request.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    request.items.forEach((item, index) => {
      if (!item.id) errors.push(`Item ${index + 1}: ID is required`);
      if (!item.name) errors.push(`Item ${index + 1}: Name is required`);
      if (!item.price || item.price <= 0) errors.push(`Item ${index + 1}: Valid price is required`);
      if (!item.quantity || item.quantity <= 0) errors.push(`Item ${index + 1}: Valid quantity is required`);
    });
  }

  // Validate discount if provided
  if (request.discount !== undefined) {
    if (request.discount < 0 || request.discount > request.amount) {
      errors.push('Discount must be between 0 and amount');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Verify webhook signature from Midtrans
 */
export const verifyWebhookSignature = (
  transactionId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean => {
  try {
    const data = `${transactionId}${statusCode}${grossAmount}${serverKey}`;
    const hash = createHash('sha512').update(data).digest('hex');
    return hash === signatureKey;
  } catch (error) {
    logger.error('Error verifying webhook signature:', error);
    return false;
  }
};

/**
 * Map Midtrans status to PaymentStatus enum
 */
export const mapMidtransStatus = (midtransStatus: string, fraudStatus?: string): PaymentStatus => {
  const statusMap: Record<string, PaymentStatus> = {
    settlement: PaymentStatus.SETTLEMENT,
    capture: PaymentStatus.CAPTURE,
    pending: PaymentStatus.PENDING,
    deny: PaymentStatus.DENY,
    cancel: PaymentStatus.CANCEL,
    expire: PaymentStatus.EXPIRE,
    refund: PaymentStatus.REFUND,
    partial_refund: PaymentStatus.PARTIAL_REFUND
  };

  // Check fraud status first
  if (fraudStatus === 'challenge') {
    return PaymentStatus.PENDING;
  }

  if (fraudStatus === 'accept') {
    return PaymentStatus.SETTLEMENT;
  }

  return statusMap[midtransStatus] || PaymentStatus.PENDING;
};

/**
 * Generate unique invoice number
 */
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${timestamp}-${random}`;
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Validate discount
 */
export const validateDiscount = (discount: number, amount: number): { valid: boolean; error?: string } => {
  if (discount < 0) {
    return { valid: false, error: 'Discount cannot be negative' };
  }

  if (discount > amount) {
    return { valid: false, error: 'Discount cannot exceed transaction amount' };
  }

  return { valid: true };
};

/**
 * Calculate tax rate (default 10% for Indonesia)
 */
export const calculateTaxRate = (subtotal: number, taxRate: number = 0.1): number => {
  return subtotal * taxRate;
};

/**
 * Get status color for UI display
 */
export const getStatusColor = (status: PaymentStatus): string => {
  const colorMap: Record<PaymentStatus, string> = {
    [PaymentStatus.PENDING]: 'warning',
    [PaymentStatus.SETTLEMENT]: 'success',
    [PaymentStatus.CAPTURE]: 'success',
    [PaymentStatus.DENY]: 'danger',
    [PaymentStatus.CANCEL]: 'secondary',
    [PaymentStatus.EXPIRE]: 'secondary',
    [PaymentStatus.REFUND]: 'info',
    [PaymentStatus.PARTIAL_REFUND]: 'info',
    [PaymentStatus.COMPLETED]: 'success',
    [PaymentStatus.FAILED]: 'danger'
  };

  return colorMap[status] || 'secondary';
};