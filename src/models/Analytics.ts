import mongoose, { Schema, Document } from 'mongoose';

/**
 * Analytics Interface
 */
export interface IAnalytics extends Document {
  type: 'enrollment' | 'revenue' | 'completion' | 'user';
  data: Record<string, any>;
  period: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Analytics Schema
 */
const analyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      enum: {
        values: ['enrollment', 'revenue', 'completion', 'user'],
        message: 'Invalid analytics type'
      },
      required: true,
      index: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: [true, 'Data is required'],
      default: {}
    },
    period: {
      type: Date,
      required: true,
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
analyticsSchema.index({ type: 1, period: -1 });
analyticsSchema.index({ createdAt: -1 });

/**
 * Export Analytics Model
 */
export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);