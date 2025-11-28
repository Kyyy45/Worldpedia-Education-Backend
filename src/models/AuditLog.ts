import mongoose, { Schema, Document } from 'mongoose';

/**
 * AuditLog Interface
 */
export interface IAuditLog extends Document {
  action: string;
  userId?: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  status: 'success' | 'failure';
  timestamp: Date;
}

/**
 * AuditLog Schema
 */
const auditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      index: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    ipAddress: {
      type: String,
      required: [true, 'IP address is required'],
      match: [
        /^(\d{1,3}\.){3}\d{1,3}$/,
        'Invalid IP address format'
      ]
    },
    userAgent: {
      type: String,
      default: ''
    },
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    status: {
      type: String,
      enum: {
        values: ['success', 'failure'],
        message: 'Status must be success or failure'
      },
      required: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
      index: true
    }
  },
  {
    timestamps: false
  }
);

/**
 * INDEXES for performance
 */
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

/**
 * Export AuditLog Model
 */
export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);