import mongoose, { Schema, Document } from 'mongoose';

/**
 * Help Interface
 */
export interface IHelp extends Document {
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Help Schema
 */
const helpSchema = new Schema<IHelp>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
      minlength: [5, 'Question must be at least 5 characters'],
      maxlength: [200, 'Question must not exceed 200 characters'],
      index: true,
      trim: true
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      minlength: [10, 'Answer must be at least 10 characters'],
      maxlength: [2000, 'Answer must not exceed 2000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'account',
          'course',
          'enrollment',
          'payment',
          'certificate',
          'technical',
          'other'
        ],
        message: 'Invalid category'
      },
      index: true
    },
    keywords: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: 'Cannot have more than 10 keywords'
      }
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
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
helpSchema.index({ question: 'text', answer: 'text', keywords: 'text' });
helpSchema.index({ category: 1, isActive: 1 });
helpSchema.index({ createdBy: 1 });
helpSchema.index({ views: -1 });
helpSchema.index({ createdAt: -1 });

/**
 * METHODS
 */

/**
 * Increment view count
 */
helpSchema.methods.incrementViews = function (): void {
  this.views += 1;
};

/**
 * Mark as helpful
 */
helpSchema.methods.markHelpful = function (): void {
  this.helpful += 1;
};

/**
 * Mark as not helpful
 */
helpSchema.methods.markNotHelpful = function (): void {
  this.notHelpful += 1;
};

/**
 * Get helpfulness percentage
 */
helpSchema.methods.getHelpfulnessPercentage = function (): number {
  const total = this.helpful + this.notHelpful;
  if (total === 0) return 0;
  return Math.round((this.helpful / total) * 100);
};

/**
 * Export Help Model
 */
export const Help = mongoose.model<IHelp>('Help', helpSchema);