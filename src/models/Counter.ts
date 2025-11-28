import mongoose, { Schema, Document } from 'mongoose';

/**
 * Counter Interface
 */
export interface ICounter extends Document {
  counterId: string;
  sequence: number;
}

/**
 * Counter Schema
 */
const counterSchema = new Schema<ICounter>(
  {
    counterId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    sequence: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: false
  }
);

/**
 * METHODS
 */

/**
 * Get next sequence number using atomic increment
 */
counterSchema.statics.getNextSequence = async function (counterId: string): Promise<number> {
  const result = await this.findByIdAndUpdate(
    counterId,
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  return result.sequence;
};

/**
 * Export Counter Model
 */
export const Counter = mongoose.model<ICounter>('Counter', counterSchema);