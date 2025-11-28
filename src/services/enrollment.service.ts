import { Enrollment, Course, User } from '../models';
import { NotFoundError, ConflictError, ForbiddenError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Enrollment Service - Handles course enrollments
 */
export class EnrollmentService {
  /**
   * Create enrollment
   */
  static async createEnrollment(studentId: string, courseId: string) {
    try {
      const student = await User.findById(studentId);
      if (!student) {
        throw new NotFoundError('Student not found');
      }

      const course = await Course.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
      if (existingEnrollment) {
        throw new ConflictError('Student already enrolled in this course');
      }

      // Check course capacity
      const enrollmentCount = await Enrollment.countDocuments({ courseId });
      if (enrollmentCount >= course.capacity) {
        throw new ConflictError('Course is full');
      }

      const enrollment = new Enrollment({
        studentId,
        courseId,
        status: 'pending_payment',
        progress: 0,
        enrolledAt: new Date()
      });

      await enrollment.save();

      // Update course enrollments
      course.totalEnrollments = (course.totalEnrollments || 0) + 1;
      await course.save();

      logger.info(`Enrollment created: ${enrollment._id}`);

      return enrollment;
    } catch (error) {
      logger.error('Create enrollment error', error);
      throw error;
    }
  }

  /**
   * Get enrollment by ID
   */
  static async getEnrollmentById(enrollmentId: string) {
    try {
      const enrollment = await Enrollment.findById(enrollmentId)
        .populate('studentId', 'fullName email username avatar')
        .populate('courseId', 'title price level');

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      return enrollment;
    } catch (error) {
      logger.error('Get enrollment error', error);
      throw error;
    }
  }

  /**
   * Get student enrollments
   */
  static async getStudentEnrollments(studentId: string, page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const skip = (page - 1) * limit;
      const query: any = { studentId };

      if (filters.status) query.status = filters.status;

      const total = await Enrollment.countDocuments(query);
      const enrollments = await Enrollment.find(query)
        .populate('courseId', 'title description price level totalEnrollments')
        .skip(skip)
        .limit(limit)
        .sort({ enrolledAt: -1 });

      return {
        enrollments,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get student enrollments error', error);
      throw error;
    }
  }

  /**
   * Update enrollment status
   */
  static async updateEnrollmentStatus(enrollmentId: string, status: string) {
    try {
      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      const validStatuses = ['pending_payment', 'active', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid enrollment status');
      }

      enrollment.status = status as 'pending_payment' | 'active' | 'completed' | 'cancelled';

      if (status === 'completed') {
        enrollment.completedDate = new Date();
      }

      await enrollment.save();

      logger.info(`Enrollment updated: ${enrollmentId} - Status: ${status}`);

      return enrollment;
    } catch (error) {
      logger.error('Update enrollment status error', error);
      throw error;
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(enrollmentId: string, progress: number) {
    try {
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100');
      }

      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      enrollment.progress = progress;

      // Auto-complete if progress is 100
      if (progress === 100 && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
        enrollment.completedDate = new Date();
      }

      await enrollment.save();

      logger.info(`Enrollment progress updated: ${enrollmentId} - Progress: ${progress}%`);

      return enrollment;
    } catch (error) {
      logger.error('Update progress error', error);
      throw error;
    }
  }

  /**
   * Cancel enrollment
   */
  static async cancelEnrollment(enrollmentId: string, studentId: string) {
    try {
      const enrollment = await Enrollment.findById(enrollmentId);

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      // Check authorization - use userId instead of studentId
      if (enrollment.userId.toString() !== studentId) {
        throw new ForbiddenError('You do not have permission to cancel this enrollment');
      }

      enrollment.status = 'cancelled';
      await enrollment.save();

      logger.info(`Enrollment cancelled: ${enrollmentId}`);

      return enrollment;
    } catch (error) {
      logger.error('Cancel enrollment error', error);
      throw error;
    }
  }

  /**
   * Get enrollment progress summary
   */
  static async getProgressSummary(studentId: string) {
    try {
      const enrollments = await Enrollment.find({ userId: studentId }).populate('courseId', 'title');

      const summary = {
        totalCourses: enrollments.length,
        activeCourses: enrollments.filter(e => e.status === 'active').length,
        completedCourses: enrollments.filter(e => e.status === 'completed').length,
        avgProgress: 0,
        courses: enrollments.map(e => {
          const courseData = e.courseId as any;
          return {
            courseId: courseData._id,
            courseName: courseData.title,
            status: e.status,
            progress: e.progress,
            enrolledAt: e.enrolledDate,
            completedAt: e.completedDate
          };
        })
      };

      if (enrollments.length > 0) {
        summary.avgProgress = Math.round(
          enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
        );
      }

      return summary;
    } catch (error) {
      logger.error('Get progress summary error', error);
      throw error;
    }
  }
}

export default EnrollmentService;