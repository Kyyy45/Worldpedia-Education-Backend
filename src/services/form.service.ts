import { Form, FormSubmission } from '../models';
import { NotFoundError, ForbiddenError, ValidationError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Form Service - Handles form management
 */
export class FormService {
  /**
   * Create form
   */
  static async createForm(formData: any, createdBy: string) {
    try {
      const { title, courseId, fields } = formData;

      // Validate fields
      if (!Array.isArray(fields) || fields.length === 0) {
        throw new ValidationError('Form must have at least one field', { fields: 'At least one field required' });
      }

      const form = new Form({
        title,
        courseId,
        fields,
        createdBy,
        isActive: true,
        submissionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await form.save();

      logger.info(`Form created: ${form._id}`);

      return form;
    } catch (error) {
      logger.error('Create form error', error);
      throw error;
    }
  }

  /**
   * Get form by ID
   */
  static async getFormById(formId: string) {
    try {
      const form = await Form.findById(formId)
        .populate('courseId', 'title')
        .populate('createdBy', 'fullName email');

      if (!form) {
        throw new NotFoundError('Form not found');
      }

      return form;
    } catch (error) {
      logger.error('Get form error', error);
      throw error;
    }
  }

  /**
   * Get forms by course
   */
  static async getFormsByCourse(courseId: string) {
    try {
      const forms = await Form.find({ courseId, isActive: true })
        .select('title description submissionCount')
        .sort({ createdAt: -1 });

      return forms;
    } catch (error) {
      logger.error('Get forms by course error', error);
      throw error;
    }
  }

  /**
   * Update form
   */
  static async updateForm(formId: string, updateData: any, userId: string) {
    try {
      const form = await Form.findById(formId);

      if (!form) {
        throw new NotFoundError('Form not found');
      }

      // Check authorization
      if (form.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to update this form');
      }

      Object.assign(form, updateData);
      form.updatedAt = new Date();

      await form.save();

      logger.info(`Form updated: ${formId}`);

      return form;
    } catch (error) {
      logger.error('Update form error', error);
      throw error;
    }
  }

  /**
   * Delete form
   */
  static async deleteForm(formId: string, userId: string) {
    try {
      const form = await Form.findById(formId);

      if (!form) {
        throw new NotFoundError('Form not found');
      }

      // Check authorization
      if (form.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to delete this form');
      }

      await Form.deleteOne({ _id: formId });

      logger.info(`Form deleted: ${formId}`);

      return { message: 'Form deleted successfully' };
    } catch (error) {
      logger.error('Delete form error', error);
      throw error;
    }
  }

  /**
   * Submit form
   */
  static async submitForm(formId: string, studentId: string, responses: any) {
    try {
      const form = await Form.findById(formId);

      if (!form) {
        throw new NotFoundError('Form not found');
      }

      if (!form.isActive) {
        throw new Error('Form is not accepting submissions');
      }

      // Validate responses
      this.validateResponses(form.fields as any, responses);

      const submission = new FormSubmission({
        formId,
        studentId,
        responses,
        submittedAt: new Date()
      });

      await submission.save();

      // Update submission count
      form.submissionCount = (form.submissionCount || 0) + 1;
      await form.save();

      logger.info(`Form submitted: ${submission._id}`);

      return submission;
    } catch (error) {
      logger.error('Submit form error', error);
      throw error;
    }
  }

  /**
   * Get form submissions
   */
  static async getFormSubmissions(formId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const total = await FormSubmission.countDocuments({ formId });
      const submissions = await FormSubmission.find({ formId })
        .populate('studentId', 'fullName email username')
        .skip(skip)
        .limit(limit)
        .sort({ submittedAt: -1 });

      return {
        submissions,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get form submissions error', error);
      throw error;
    }
  }

  /**
   * Get student submission
   */
  static async getStudentSubmission(formId: string, studentId: string) {
    try {
      const submission = await FormSubmission.findOne({ formId, studentId });

      if (!submission) {
        throw new NotFoundError('Submission not found');
      }

      return submission;
    } catch (error) {
      logger.error('Get student submission error', error);
      throw error;
    }
  }

  /**
   * Get form analytics
   */
  static async getFormAnalytics(formId: string) {
    try {
      const form = await Form.findById(formId);

      if (!form) {
        throw new NotFoundError('Form not found');
      }

      const submissions = await FormSubmission.find({ formId });
      const fields = form.fields as any;

      const analytics = {
        formId,
        totalSubmissions: submissions.length,
        completionRate: 0,
        fieldAnalytics: fields.map((field: any) => ({
          fieldId: field.fieldId,
          fieldName: field.fieldName,
          fieldType: field.fieldType,
          responseCounts: {}
        }))
      };

      // Calculate analytics for each field
      submissions.forEach(submission => {
        Object.keys(submission.responses).forEach(fieldId => {
          const response = submission.responses[fieldId];
          const fieldAnalytic = analytics.fieldAnalytics.find((f: any) => f.fieldId === fieldId);

          if (fieldAnalytic) {
            if (!fieldAnalytic.responseCounts[response]) {
              fieldAnalytic.responseCounts[response] = 0;
            }
            fieldAnalytic.responseCounts[response]++;
          }
        });
      });

      analytics.completionRate = submissions.length > 0 ? 100 : 0;

      return analytics;
    } catch (error) {
      logger.error('Get form analytics error', error);
      throw error;
    }
  }

  /**
   * Validate form responses
   */
  private static validateResponses(fields: any[], responses: any): void {
    fields.forEach(field => {
      if (field.required && !responses[field.fieldId]) {
        throw new ValidationError('Validation failed', { [field.fieldName]: 'This field is required' });
      }

      // Add more validation rules as needed
      if (field.fieldType === 'email' && responses[field.fieldId]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(responses[field.fieldId])) {
          throw new ValidationError('Validation failed', { [field.fieldName]: 'Invalid email format' });
        }
      }
    });
  }
}

export default FormService;