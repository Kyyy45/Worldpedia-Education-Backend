import mongoose, { Schema, Document } from 'mongoose';

/**
 * Payment Interface
 */
export interface IPayment extends Document {
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId; // Alias for userId
  courseId?: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionId: string;
  midtransToken?: string;
  redirectUrl?: string;
  failureReason?: string;
  paidAt?: Date;
  completedAt?: Date; // Alias for paidAt
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
      required: [true, 'Enrollment ID is required'],
      index: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'cancelled'],
        message: 'Invalid payment status'
      },
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['credit_card', 'debit_card', 'bank_transfer', 'e_wallet'],
        message: 'Invalid payment method'
      }
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
      index: true
    },
    midtransToken: {
      type: String,
      default: null
    },
    redirectUrl: {
      type: String,
      default: null
    },
    failureReason: {
      type: String,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES for performance
 */
paymentSchema.index({ enrollmentId: 1, status: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paidAt: 1 });

/**
 * METHODS
 */

/**
 * Mark payment as completed
 */
paymentSchema.methods.markCompleted = function (): void {
  this.status = 'completed';
  this.paidAt = new Date();
};

/**
 * Mark payment as failed
 */
paymentSchema.methods.markFailed = function (reason: string): void {
  this.status = 'failed';
  this.failureReason = reason;
};

/**
 * VIRTUAL FIELDS - Aliases for service compatibility
 */

// studentId is an alias for userId
paymentSchema.virtual('studentId').get(function () {
  return this.userId;
}).set(function (value) {
  this.userId = value;
});

// completedAt is an alias for paidAt
paymentSchema.virtual('completedAt').get(function () {
  return this.paidAt;
}).set(function (value) {
  this.paidAt = value;
});

// Enable virtual fields in JSON output
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

/**
 * Export Payment Model
 */
export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);