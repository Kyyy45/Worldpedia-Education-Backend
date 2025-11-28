import { Certificate, CertificateBatch, Enrollment, Course } from '../models';
import { NotFoundError, ConflictError } from '../types/error.types';
import { logger } from '../utils/logger';

/**
 * Certificate Service - Handles certificate management
 */
export class CertificateService {
  /**
   * Create certificate batch
   */
  static async createCertificateBatch(batchData: any) {
    try {
      const { courseId, batchName, googleDriveFolderId, certificateCount } = batchData;

      const course = await Course.findById(courseId);
      if (!course) {
        throw new NotFoundError('Course not found');
      }

      const batch = new CertificateBatch({
        courseId,
        batchName,
        googleDriveFolderId,
        certificateCount,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await batch.save();

      logger.info(`Certificate batch created: ${batch._id}`);

      return batch;
    } catch (error) {
      logger.error('Create certificate batch error', error);
      throw error;
    }
  }

  /**
   * Generate certificate for student
   */
  static async generateCertificate(enrollmentId: string) {
    try {
      const enrollment = await Enrollment.findById(enrollmentId)
        .populate('studentId')
        .populate('courseId');

      if (!enrollment) {
        throw new NotFoundError('Enrollment not found');
      }

      if (enrollment.status !== 'completed') {
        throw new Error('Student must complete the course to get certificate');
      }

      // Check if certificate already exists
      const existingCert = await Certificate.findOne({ enrollmentId });
      if (existingCert) {
        throw new ConflictError('Certificate already issued for this enrollment');
      }

      // Get course for batch info
      const course = enrollment.courseId as any;
      const batch = await CertificateBatch.findOne({ courseId: course._id })
        .sort({ createdAt: -1 });

      // Generate serial number
      const serialNumber = this.generateSerialNumber();

      const certificate = new Certificate({
        enrollmentId,
        studentId: enrollment.studentId,
        courseId: enrollment.courseId,
        serialNumber,
        issueDate: new Date(),
        batchId: batch?._id,
        googleDriveLink: '',
        status: 'issued'
      });

      await certificate.save();

      logger.info(`Certificate generated: ${certificate._id}`);

      return certificate;
    } catch (error) {
      logger.error('Generate certificate error', error);
      throw error;
    }
  }

  /**
   * Get certificate by ID
   */
  static async getCertificateById(certificateId: string) {
    try {
      const certificate = await Certificate.findById(certificateId)
        .populate('studentId', 'fullName email username')
        .populate('courseId', 'title level')
        .populate('batchId');

      if (!certificate) {
        throw new NotFoundError('Certificate not found');
      }

      return certificate;
    } catch (error) {
      logger.error('Get certificate error', error);
      throw error;
    }
  }

  /**
   * Get student certificates
   */
  static async getStudentCertificates(studentId: string) {
    try {
      const certificates = await Certificate.find({ studentId })
        .populate('courseId', 'title level')
        .sort({ issueDate: -1 });

      return certificates;
    } catch (error) {
      logger.error('Get student certificates error', error);
      throw error;
    }
  }

  /**
   * Get course certificates
   */
  static async getCourseCertificates(courseId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const total = await Certificate.countDocuments({ courseId });
      const certificates = await Certificate.find({ courseId })
        .populate('studentId', 'fullName email username')
        .skip(skip)
        .limit(limit)
        .sort({ issueDate: -1 });

      return {
        certificates,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get course certificates error', error);
      throw error;
    }
  }

  /**
   * Verify certificate
   */
  static async verifyCertificate(serialNumber: string) {
    try {
      const certificate = await Certificate.findOne({ serialNumber })
        .populate('studentId', 'fullName')
        .populate('courseId', 'title level');

      if (!certificate) {
        throw new NotFoundError('Certificate not found');
      }

      return {
        valid: true,
        certificate: {
          serialNumber: certificate.serialNumber,
          studentName: (certificate.studentId as any).fullName,
          courseName: (certificate.courseId as any).title,
          issueDate: certificate.issueDate,
          status: certificate.status
        }
      };
    } catch (error) {
      logger.error('Verify certificate error', error);
      throw error;
    }
  }

  /**
   * Update certificate Google Drive link
   */
  static async updateGoogleDriveLink(certificateId: string, driveLink: string) {
    try {
      const certificate = await Certificate.findById(certificateId);

      if (!certificate) {
        throw new NotFoundError('Certificate not found');
      }

      certificate.googleDriveLink = driveLink;
      await certificate.save();

      logger.info(`Certificate Google Drive link updated: ${certificateId}`);

      return certificate;
    } catch (error) {
      logger.error('Update Google Drive link error', error);
      throw error;
    }
  }

  /**
   * Get batch certificates
   */
  static async getBatchCertificates(batchId: string, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;

      const total = await Certificate.countDocuments({ batchId });
      const certificates = await Certificate.find({ batchId })
        .populate('studentId', 'fullName email')
        .populate('courseId', 'title')
        .skip(skip)
        .limit(limit)
        .sort({ issueDate: -1 });

      return {
        certificates,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Get batch certificates error', error);
      throw error;
    }
  }

  /**
   * Generate serial number
   */
  private static generateSerialNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }
}

export default CertificateService;