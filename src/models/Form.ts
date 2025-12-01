import mongoose, { Schema, Document } from 'mongoose';

/**
 * Form Field Interface
 */
export interface IFormField {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

/**
 * Form Interface
 */
export interface IForm extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  fields: IFormField[];
  isActive: boolean;
  submissionCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form Schema
 */
const formSchema = new Schema<IForm>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Form title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title must not exceed 100 characters'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Form description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    fields: {
      type: [
        {
          fieldId: {
            type: String,
            required: true
          },
          fieldName: {
            type: String,
            required: true,
            lowercase: true
          },
          fieldType: {
            type: String,
            enum: [
              'text',
              'email',
              'number',
              'date',
              'checkbox',
              'radio',
              'select',
              'textarea'
            ],
            required: true
          },
          label: {
            type: String,
            required: true
          },
          placeholder: String,
          required: {
            type: Boolean,
            default: false
          },
          options: [String],
          validation: {
            minLength: Number,
            maxLength: Number,
            pattern: String,
            min: Number,
            max: Number
          }
        }
      ],
      required: true,
      validate: {
        validator: function (v: IFormField[]) {
          return v.length >= 1 && v.length <= 50;
        },
        message: 'Form must have between 1 and 50 fields'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    submissionCount: {
      type: Number,
      default: 0,
      min: 0
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
formSchema.index({ courseId: 1, isActive: 1 });
formSchema.index({ createdBy: 1 });
formSchema.index({ createdAt: -1 });

/**
 * METHODS
 */

/**
 * Add new field to form
 */
formSchema.methods.addField = function (field: IFormField): void {
  if (this.fields.length >= 50) {
    throw new Error('Form cannot have more than 50 fields');
  }
  this.fields.push(field);
};

/**
 * Remove field from form
 */
formSchema.methods.removeField = function (fieldId: string): void {
  this.fields = this.fields.filter((f: IFormField) => f.fieldId !== fieldId);
};

/**
 * Increment submission count
 */
formSchema.methods.incrementSubmissionCount = function (): void {
  this.submissionCount += 1;
};

/**
 * Export Form Model
 */
export const Form = mongoose.model<IForm>('Form', formSchema);