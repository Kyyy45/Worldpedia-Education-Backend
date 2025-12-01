import mongoose, { Schema, Document } from 'mongoose';

/**
 * Course Interface
 */
export interface ICourse extends Document {
  title: string;
  description: string;
  level: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'UMUM';
  price: number;
  instructorName: string;
  duration: number;
  modules: string[];
  capacity: number;
  enrollmentCount: number;
  totalEnrollments?: number; // Alias for enrollmentCount
  totalRevenue: number;
  thumbnail?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Course Schema
 */
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
      unique: true,
      index: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description must not exceed 2000 characters']
    },
    level: {
      type: String,
      enum: {
        values: ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'UMUM'],
        message: 'Invalid course level'
      },
      required: [true, 'Course level is required'],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      max: [1000000000, 'Price exceeds maximum allowed']
    },
    instructorName: {
      type: String,
      required: [true, 'Instructor name is required'],
      minlength: [3, 'Instructor name must be at least 3 characters'],
      maxlength: [100, 'Instructor name must not exceed 100 characters'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 week']
    },
    modules: {
      type: [String],
      required: [true, 'Modules are required'],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 1 && v.length <= 10;
        },
        message: 'Must have between 1 and 10 modules'
      }
    },
    capacity: {
      type: Number,
      required: [true, 'Course capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [500, 'Capacity cannot exceed 500']
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    thumbnail: {
      type: String,
      default: null
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
    }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES for performance
 */
courseSchema.index({ title: 'text', description: 'text', instructorName: 'text' });
courseSchema.index({ level: 1, isActive: 1 });
courseSchema.index({ instructorName: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ createdBy: 1 });

/**
 * VIRTUAL FIELDS - Aliases for service compatibility
 */

// totalEnrollments is an alias for enrollmentCount
courseSchema.virtual('totalEnrollments').get(function () {
  return this.enrollmentCount;
}).set(function (value) {
  this.enrollmentCount = value;
});

// Enable virtual fields in JSON output
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

/**
 * METHODS
 */

/**
 * Check if course has capacity
 */
courseSchema.methods.hasCapacity = function (): boolean {
  return this.enrollmentCount < this.capacity;
};

/**
 * Get enrollment percentage
 */
courseSchema.methods.getEnrollmentPercentage = function (): number {
  if (this.capacity === 0) return 0;
  return Math.round((this.enrollmentCount / this.capacity) * 100);
};

/**
 * Export Course Model
 */
export const Course = mongoose.model<ICourse>('Course', courseSchema);