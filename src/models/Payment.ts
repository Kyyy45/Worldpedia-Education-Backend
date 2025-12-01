import mongoose, { Schema, Document } from 'mongoose';
import { PaymentStatus } from '../types/payment.types';

/**
 * Payment Interface
 */
export interface IPayment extends Document {
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  orderId: string; 
  midtransToken?: string;
  redirectUrl?: string;
  failureReason?: string;
  paidAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Schema
 */
const paymentSchema = new Schema<IPayment>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'unknown'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    midtransToken: { type: String, default: null },
    redirectUrl: { type: String, default: null },
    failureReason: { type: String, default: null },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

/**
 * INDEXES
 */
paymentSchema.index({ enrollmentId: 1, status: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paidAt: 1 });

/**
 * METHODS
 */
paymentSchema.methods.markCompleted = function (): void {
  this.status = PaymentStatus.COMPLETED;
  this.paidAt = new Date();
};

paymentSchema.methods.markFailed = function (reason: string): void {
  this.status = PaymentStatus.FAILED;
  this.failureReason = reason;
};

/**
 * VIRTUAL FIELDS
 */
paymentSchema.virtual('studentId').get(function () { return this.userId; }).set(function (value) { this.userId = value; });
paymentSchema.virtual('completedAt').get(function () { return this.paidAt; }).set(function (value) { this.paidAt = value; });

paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);