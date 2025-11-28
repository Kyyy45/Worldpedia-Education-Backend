import mongoose, { Schema, Document } from 'mongoose';

/**
 * FormSubmission Interface
 */
export interface IFormSubmission extends Document {
  formId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  responses: Record<string, any>;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FormSubmission Schema
 */
const formSubmissionSchema = new Schema<IFormSubmission>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
      index: true
    },
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
    responses: {
      type: Schema.Types.Mixed,
      required: [true, 'Responses are required'],
      default: {}
    },
    submittedAt: {
      type: Date,
      default: () => new Date(),
      index: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES for performance
 */
formSubmissionSchema.index({ formId: 1, enrollmentId: 1 });
formSubmissionSchema.index({ userId: 1, formId: 1 });
formSubmissionSchema.index({ submittedAt: -1 });

/**
 * Prevent duplicate submissions
 */
formSubmissionSchema.index({ enrollmentId: 1, formId: 1 }, { unique: true });

/**
 * Export FormSubmission Model
 */
export const FormSubmission = mongoose.model<IFormSubmission>(
  'FormSubmission',
  formSubmissionSchema
);