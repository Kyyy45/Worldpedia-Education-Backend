import mongoose, { Schema, Document } from 'mongoose';

/**
 * CertificateBatch Interface
 */
export interface ICertificateBatch extends Document {
  courseId: mongoose.Types.ObjectId;
  batchName: string;
  googleDriveFolderId: string;
  startSequence: number;
  certificateCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CertificateBatch Schema
 */
const certificateBatchSchema = new Schema<ICertificateBatch>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true
    },
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      minlength: [3, 'Batch name must be at least 3 characters'],
      maxlength: [100, 'Batch name must not exceed 100 characters'],
      trim: true
    },
    googleDriveFolderId: {
      type: String,
      required: [true, 'Google Drive Folder ID is required'],
      unique: true
    },
    startSequence: {
      type: Number,
      required: [true, 'Start sequence is required'],
      min: [1, 'Start sequence must be at least 1']
    },
    certificateCount: {
      type: Number,
      required: [true, 'Certificate count is required'],
      min: [1, 'Must have at least 1 certificate'],
      max: [10000, 'Cannot exceed 10000 certificates']
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES for performance
 */
certificateBatchSchema.index({ courseId: 1 });
certificateBatchSchema.index({ createdAt: -1 });

/**
 * METHODS
 */

/**
 * Get end sequence number
 */
certificateBatchSchema.methods.getEndSequence = function (): number {
  return this.startSequence + this.certificateCount - 1;
};

/**
 * Export CertificateBatch Model
 */
export const CertificateBatch = mongoose.model<ICertificateBatch>(
  'CertificateBatch',
  certificateBatchSchema
);