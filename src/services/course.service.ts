import { Course, Enrollment } from '../models';
import { NotFoundError, ConflictError, ForbiddenError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Course Service - Handles course management
 */
export class CourseService {
  /**
   * Create new course
   */
  static async createCourse(courseData: any) {
    try {
      const { title } = courseData;

      // Check if course already exists
      const existingCourse = await Course.findOne({ title: title.toLowerCase() });
      if (existingCourse) {
        throw new ConflictError('Course with this title already exists');
      }

      const course = new Course({
        ...courseData,
        title: title.toLowerCase(),
        createdBy: courseData.createdBy,
        totalEnrollments: 0,
        totalRevenue: 0
      });

      await course.save();
      logger.info(`Course created: ${course._id}`);

      return course;
    } catch (error) {
      logger.error('Create course error', error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  static async getCourseById(courseId: string) {
    try {
      const course = await Course.findById(courseId).populate('createdBy', 'fullName email');

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      return course;
    } catch (error) {
      logger.error('Get course error', error);
      throw error;
    }
  }

  /**
   * Get all courses with pagination and filters
   */
  static async getAllCourses(page: number = 1, limit: number = 10, filters: any = {}) {
    try {
      const skip = (page - 1) * limit;
      const query: any = { isActive: true };

      // Apply filters
      if (filters.level) query.level = filters.level;
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }
      if (filters.minPrice !== undefined) query.price = { $gte: filters.minPrice };
      if (filters.maxPrice !== undefined) {
        query.price = query.price ? { ...query.price, $lte: filters.maxPrice } : { $lte: filters.maxPrice };
      }

      const total = await Course.countDocuments(query);
      const courses = await Course.find(query)
        .select('-moduleDetails')
        .populate('createdBy', 'fullName email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      return {
        courses,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get all courses error', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  static async updateCourse(courseId: string, updateData: any, userId: string) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check authorization
      if (course.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to update this course');
      }

      // Update fields
      Object.assign(course, updateData);

      await course.save();
      logger.info(`Course updated: ${courseId}`);

      return course;
    } catch (error) {
      logger.error('Update course error', error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string, userId: string) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      // Check authorization
      if (course.createdBy.toString() !== userId) {
        throw new ForbiddenError('You do not have permission to delete this course');
      }

      // Check if course has enrollments
      const enrollmentCount = await Enrollment.countDocuments({ courseId });
      if (enrollmentCount > 0) {
        throw new ConflictError('Cannot delete course with active enrollments');
      }

      await Course.deleteOne({ _id: courseId });
      logger.info(`Course deleted: ${courseId}`);

      return { message: 'Course deleted successfully' };
    } catch (error) {
      logger.error('Delete course error', error);
      throw error;
    }
  }

  /**
   * Get course enrollments
   */
  static async getCourseEnrollments(courseId: string, page: number = 1, limit: number = 10) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const skip = (page - 1) * limit;
      const total = await Enrollment.countDocuments({ courseId });
      const enrollments = await Enrollment.find({ courseId })
        .populate('studentId', 'fullName email username')
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
      logger.error('Get course enrollments error', error);
      throw error;
    }
  }

  /**
   * Get course statistics
   */
  static async getCourseStats(courseId: string) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const enrollments = await Enrollment.find({ courseId });
      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const activeCount = enrollments.filter(e => e.status === 'active').length;

      const avgProgress = enrollments.length > 0
        ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
        : 0;

      return {
        courseId,
        totalEnrollments: course.totalEnrollments,
        activeEnrollments: activeCount,
        completedEnrollments: completedCount,
        avgProgress: Math.round(avgProgress),
        totalRevenue: course.totalRevenue,
        capacity: course.capacity,
        availableSeats: course.capacity - enrollments.length
      };
    } catch (error) {
      logger.error('Get course stats error', error);
      throw error;
    }
  }

  /**
   * Search courses
   */
  static async searchCourses(query: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const searchQuery = {
        isActive: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      };

      const total = await Course.countDocuments(searchQuery);
      const courses = await Course.find(searchQuery)
        .select('-moduleDetails')
        .populate('createdBy', 'fullName email')
        .skip(skip)
        .limit(limit);

      return {
        courses,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Search courses error', error);
      throw error;
    }
  }
}

export default CourseService;