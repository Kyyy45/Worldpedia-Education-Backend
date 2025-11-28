import mongoose, { Schema, Document } from 'mongoose';

/**
 * Certificate Interface
 */
export interface ICertificate extends Document {
  enrollmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  googleDriveFileId: string;
  googleDriveLink: string;
  fileName: string;
  sequenceNumber: number;
  serialNumber: string;
  status: 'available' | 'assigned' | 'accessed';
  issueDate: Date;
  assignedTo?: mongoose.Types.ObjectId;
  assignedDate?: Date;
  accessedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Certificate Schema
 */
const certificateSchema = new Schema<ICertificate>(
  {
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: [true, 'Enrollment ID is required'],
      index: true,
      unique: true
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'CertificateBatch',
      default: null,
      index: true
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true
    },
    googleDriveFileId: {
      type: String,
      required: [true, 'Google Drive File ID is required'],
      unique: true
    },
    googleDriveLink: {
      type: String,
      required: [true, 'Google Drive link is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    sequenceNumber: {
      type: Number,
      required: [true, 'Sequence number is required']
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      index: true,
      // Format: CERT-{timestamp}-{random}
      match: [/^CERT-\d+-[A-Z0-9]+$/, 'Invalid serial number format']
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'assigned', 'accessed'],
        message: 'Invalid certificate status'
      },
      default: 'available',
      index: true
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
      default: () => new Date(),
      index: true
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    assignedDate: {
      type: Date,
      default: null
    },
    accessedDate: {
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
certificateSchema.index({ batchId: 1, status: 1 });
certificateSchema.index({ courseId: 1, status: 1 });
certificateSchema.index({ assignedTo: 1, status: 1 });
certificateSchema.index({ createdAt: -1 });

/**
 * METHODS
 */

/**
 * Assign certificate to user (FIFO queue)
 */
certificateSchema.methods.assignToUser = function (userId: mongoose.Types.ObjectId): void {
  if (this.status !== 'available') {
    throw new Error('Certificate is not available for assignment');
  }
  this.assignedTo = userId;
  this.status = 'assigned';
  this.assignedDate = new Date();
};

/**
 * Mark certificate as accessed
 */
certificateSchema.methods.markAccessed = function (): void {
  if (this.status !== 'assigned') {
    throw new Error('Certificate must be assigned before marking as accessed');
  }
  this.status = 'accessed';
  this.accessedDate = new Date();
};

/**
 * Export Certificate Model
 */
export const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);