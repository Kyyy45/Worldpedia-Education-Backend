import mongoose, { Schema, Document } from 'mongoose';

/**
 * Enrollment Interface
 */
export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId; // Alias for userId
  courseId: mongoose.Types.ObjectId;
  status: 'pending_payment' | 'active' | 'completed' | 'cancelled';
  enrolledDate: Date;
  enrolledAt?: Date; // Alias for enrolledDate
  progress: number;
  completedDate?: Date;
  completedAt?: Date; // Alias for completedDate
  certificateId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Enrollment Schema
 */
const enrollmentSchema = new Schema<IEnrollment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending_payment', 'active', 'completed', 'cancelled'],
        message: 'Invalid enrollment status'
      },
      default: 'pending_payment',
      index: true
    },
    enrolledDate: {
      type: Date,
      default: () => new Date(),
      index: true
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100']
    },
    completedDate: {
      type: Date,
      default: null
    },
    certificateId: {
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
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
enrollmentSchema.index({ userId: 1, courseId: 1, status: 1 });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1, status: 1 });
enrollmentSchema.index({ enrolledDate: -1 });
enrollmentSchema.index({ certificateId: 1 });

/**
 * Prevent duplicate enrollments
 */
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

/**
 * METHODS
 */

/**
 * Mark enrollment as completed
 */
enrollmentSchema.methods.markCompleted = function (): void {
  this.status = 'completed';
  this.progress = 100;
  this.completedDate = new Date();
};

/**
 * Update progress
 */
enrollmentSchema.methods.updateProgress = function (newProgress: number): void {
  if (newProgress < 0 || newProgress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }
  this.progress = newProgress;
  if (newProgress === 100) {
    this.markCompleted();
  }
};

/**
 * VIRTUAL FIELDS - Aliases for service compatibility
 */

// studentId is an alias for userId
enrollmentSchema.virtual('studentId').get(function () {
  return this.userId;
}).set(function (value) {
  this.userId = value;
});

// enrolledAt is an alias for enrolledDate
enrollmentSchema.virtual('enrolledAt').get(function () {
  return this.enrolledDate;
}).set(function (value) {
  this.enrolledDate = value;
});

// completedAt is an alias for completedDate
enrollmentSchema.virtual('completedAt').get(function () {
  return this.completedDate;
}).set(function (value) {
  this.completedDate = value;
});

// Enable virtual fields in JSON output
enrollmentSchema.set('toJSON', { virtuals: true });
enrollmentSchema.set('toObject', { virtuals: true });

/**
 * Export Enrollment Model
 */
export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);