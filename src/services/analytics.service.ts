import { Analytics, Enrollment, Payment, Course, User } from '../models';
import { NotFoundError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Analytics Service - Handles dashboard analytics
 */
export class AnalyticsService {
  /**
   * Get overall dashboard analytics
   */
  static async getDashboardAnalytics(startDate?: Date, endDate?: Date) {
    try {
      const query: any = {};

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      // Get enrollment data
      const totalEnrollments = await Enrollment.countDocuments(query);
      const activeEnrollments = await Enrollment.countDocuments({ status: 'active', ...query });
      const completedEnrollments = await Enrollment.countDocuments({ status: 'completed', ...query });

      // Get revenue data
      const payments = await Payment.find({ status: 'completed', ...query });
      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      // Get user data
      const totalUsers = await User.countDocuments();
      const studentCount = await User.countDocuments({ role: 'student' });
      const instructorCount = await User.countDocuments({ role: 'admin' });

      // Get course data
      const totalCourses = await Course.countDocuments();
      const activeCourses = await Course.countDocuments({ isActive: true });

      // Calculate metrics
      const completionRate = totalEnrollments > 0
        ? ((completedEnrollments / totalEnrollments) * 100).toFixed(2)
        : 0;

      const avgEnrollmentsPerCourse = totalCourses > 0
        ? Math.round(totalEnrollments / totalCourses)
        : 0;

      const avgRevenuePerEnrollment = totalEnrollments > 0
        ? Math.round(totalRevenue / totalEnrollments)
        : 0;

      return {
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
          completed: completedEnrollments,
          completionRate
        },
        revenue: {
          total: totalRevenue,
          avgPerEnrollment: avgRevenuePerEnrollment,
          transactions: payments.length
        },
        users: {
          total: totalUsers,
          students: studentCount,
          instructors: instructorCount
        },
        courses: {
          total: totalCourses,
          active: activeCourses
        },
        metrics: {
          avgEnrollmentsPerCourse,
          conversionRate: '0%'
        }
      };
    } catch (error) {
      logger.error('Get dashboard analytics error', error);
      throw error;
    }
  }

  /**
   * Get course-specific analytics
   */
  static async getCourseAnalytics(courseId: string) {
    try {
      const course = await Course.findById(courseId);

      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const enrollments = await Enrollment.find({ courseId });
      const payments = await Payment.find({ courseId, status: 'completed' });

      const completedCount = enrollments.filter(e => e.status === 'completed').length;
      const activeCount = enrollments.filter(e => e.status === 'active').length;
      const cancelledCount = enrollments.filter(e => e.status === 'cancelled').length;

      const avgProgress = enrollments.length > 0
        ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
        : 0;

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      const completionRate = enrollments.length > 0
        ? ((completedCount / enrollments.length) * 100).toFixed(2)
        : 0;

      return {
        courseId,
        courseName: course.title,
        enrollments: {
          total: enrollments.length,
          active: activeCount,
          completed: completedCount,
          cancelled: cancelledCount,
          completionRate
        },
        progress: {
          avgProgress,
          totalProgress: enrollments.reduce((sum, e) => sum + e.progress, 0)
        },
        revenue: {
          total: totalRevenue,
          transactions: payments.length
        }
      };
    } catch (error) {
      logger.error('Get course analytics error', error);
      throw error;
    }
  }

  /**
   * Get enrollment trends (by date)
   */
  static async getEnrollmentTrends(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const enrollments = await Enrollment.find({
        enrolledAt: { $gte: startDate }
      });

      const trendData: any = {};

      enrollments.forEach(enrollment => {
        const dateValue = enrollment.enrolledDate || enrollment.enrolledAt;
        if (dateValue) {
          const date = new Date(dateValue as Date).toISOString().split('T')[0];
          if (!trendData[date]) {
            trendData[date] = 0;
          }
          trendData[date]++;
        }
      });

      return {
        period: `Last ${days} days`,
        data: Object.entries(trendData).map(([date, count]) => ({
          date,
          enrollments: count
        }))
      };
    } catch (error) {
      logger.error('Get enrollment trends error', error);
      throw error;
    }
  }

  /**
   * Get revenue trends
   */
  static async getRevenueTrends(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const payments = await Payment.find({
        status: 'completed',
        paidAt: { $gte: startDate }
      });

      const trendData: any = {};

      payments.forEach(payment => {
        const dateValue = payment.paidAt || payment.completedAt;
        if (dateValue) {
          const date = new Date(dateValue as Date).toISOString().split('T')[0];
          if (!trendData[date]) {
            trendData[date] = 0;
          }
          trendData[date] += payment.amount;
        }
      });

      return {
        period: `Last ${days} days`,
        data: Object.entries(trendData).map(([date, revenue]) => ({
          date,
          revenue
        }))
      };
    } catch (error) {
      logger.error('Get revenue trends error', error);
      throw error;
    }
  }

  /**
   * Get top courses by enrollment
   */
  static async getTopCourses(limit: number = 10) {
    try {
      const courses = await Course.find()
        .sort({ totalEnrollments: -1 })
        .limit(limit);

      return courses.map(course => ({
        courseId: course._id,
        title: course.title,
        level: course.level,
        enrollments: course.totalEnrollments,
        revenue: course.totalRevenue,
        price: course.price
      }));
    } catch (error) {
      logger.error('Get top courses error', error);
      throw error;
    }
  }

  /**
   * Get student progress distribution
   */
  static async getProgressDistribution() {
    try {
      const enrollments = await Enrollment.find();

      const distribution = {
        '0-25%': 0,
        '25-50%': 0,
        '50-75%': 0,
        '75-100%': 0
      };

      enrollments.forEach(enrollment => {
        const progress = enrollment.progress;
        if (progress < 25) distribution['0-25%']++;
        else if (progress < 50) distribution['25-50%']++;
        else if (progress < 75) distribution['50-75%']++;
        else distribution['75-100%']++;
      });

      return distribution;
    } catch (error) {
      logger.error('Get progress distribution error', error);
      throw error;
    }
  }

  /**
   * Get payment methods breakdown
   */
  static async getPaymentMethodsBreakdown() {
    try {
      const payments = await Payment.find({ status: 'completed' });

      const breakdown: any = {};

      payments.forEach(payment => {
        if (!breakdown[payment.paymentMethod]) {
          breakdown[payment.paymentMethod] = {
            count: 0,
            total: 0
          };
        }
        breakdown[payment.paymentMethod].count++;
        breakdown[payment.paymentMethod].total += payment.amount;
      });

      return breakdown;
    } catch (error) {
      logger.error('Get payment methods breakdown error', error);
      throw error;
    }
  }

  /**
   * Get level-wise enrollment distribution
   */
  static async getLevelDistribution() {
    try {
      const courses = await Course.find();

      const distribution: any = {};

      courses.forEach(course => {
        if (!distribution[course.level]) {
          distribution[course.level] = {
            courses: 0,
            enrollments: 0
          };
        }
        distribution[course.level].courses++;
        distribution[course.level].enrollments += course.totalEnrollments;
      });

      return distribution;
    } catch (error) {
      logger.error('Get level distribution error', error);
      throw error;
    }
  }

  /**
   * Export analytics to analytics collection
   */
  static async exportAnalytics() {
    try {
      const dashboardData = await this.getDashboardAnalytics();

      const analytics = new Analytics({
        dashboardMetrics: dashboardData,
        exportedAt: new Date(),
        period: 'monthly'
      });

      await analytics.save();

      logger.info(`Analytics exported: ${analytics._id}`);

      return analytics;
    } catch (error) {
      logger.error('Export analytics error', error);
      throw error;
    }
  }
}

export default AnalyticsService;