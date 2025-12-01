/**
 * Payment & Transaction Types
 */

export enum PaymentStatus {
  PENDING = 'pending',
  SETTLEMENT = 'settlement',
  CAPTURE = 'capture',
  DENY = 'deny',
  CANCEL = 'cancel',
  EXPIRE = 'expire',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  ECHANNEL = 'echannel',
  E_WALLET = 'e_wallet',
  BNPL = 'bnpl',
  COD = 'cod'
}

export interface TransactionData {
  transactionId: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus; // Update tipe ke Enum
  paymentMethod?: PaymentMethod | string;
  snapToken?: string;
  redirectUrl?: string;
  createdAt: Date;
  paidAt?: Date;
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface Address {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface ItemDetail {
  id: string;
  name: string;
  price: number;
  quantity: number;
  merchantName?: string;
}

export interface TransactionRequest {
  amount: number;
  orderId: string;
  userId: string;
  customerDetails: CustomerDetails;
  items: ItemDetail[];
  description?: string;
  discount?: number;
  metadata?: Record<string, any>;
}

export interface PaymentVerification {
  transactionId: string;
  orderId: string;
  status: PaymentStatus;
  paidAt?: Date;
  paymentMethod?: string;
  grossAmount?: number;
}

export interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  transactionId: string;
  status: string;
  amount: number;
  createdAt: Date;
}

export interface WebhookPayload {
  transaction_id: string;
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  transaction_time: string;
  gross_amount: number;
  payment_type?: string;
  signature_key?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface InvoiceData {
  invoiceId: string;
  transactionId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  paidAt?: Date;
  notes?: string;
}

export interface PaymentHistory {
  transactionId: string;
  orderId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod | string;
  createdAt: Date;
  paidAt?: Date;
}

export interface CreatePaymentResponse {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  snapToken: string;
  redirectUrl: string;
  expiresAt: Date;
  message: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  paidAt?: Date;
  paymentMethod?: string;
  amount: number;
  message: string;
}

export interface PaymentStatistics {
  totalTransactions: number;
  totalRevenue: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  averageTransactionAmount: number;
  successRate: number;
}