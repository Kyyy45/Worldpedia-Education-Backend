import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services';
import { successResponse, paginatedResponse, createdResponse } from '../utils';
import { logger } from '../utils/logger';

/**
 * Certificate Controller - Handles certificate management endpoints
 */
export class CertificateController {
  /**
   * Create certificate batch
   * POST /api/certificates/batch
   */
  static async createCertificateBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId, batchName, googleDriveFolderId, certificateCount } = req.body;

      if (!courseId || !batchName || !googleDriveFolderId || !certificateCount) {
        res.status(400).json({
          success: false,
          error: 'All fields are required'
        });
        return;
      }

      const batch = await CertificateService.createCertificateBatch(req.body);

      res.status(201).json(createdResponse(batch, 'Certificate batch created successfully'));
    } catch (error) {
      logger.error('Create certificate batch controller error', error);
      next(error);
    }
  }

  /**
   * Generate certificate for student
   * POST /api/certificates/:enrollmentId
   */
  static async generateCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId } = req.params;

      const certificate = await CertificateService.generateCertificate(enrollmentId);

      res.status(201).json(createdResponse(certificate, 'Certificate generated successfully'));
    } catch (error) {
      logger.error('Generate certificate controller error', error);
      next(error);
    }
  }

  /**
   * Get certificate by ID
   * GET /api/certificates/:id
   */
  static async getCertificateById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const certificate = await CertificateService.getCertificateById(id);

      res.status(200).json(successResponse(certificate));
    } catch (error) {
      logger.error('Get certificate controller error', error);
      next(error);
    }
  }

  /**
   * Get student certificates
   * GET /api/certificates/student/:studentId
   */
  static async getStudentCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;

      const certificates = await CertificateService.getStudentCertificates(studentId);

      res.status(200).json(successResponse(certificates));
    } catch (error) {
      logger.error('Get student certificates controller error', error);
      next(error);
    }
  }

  /**
   * Get course certificates
   * GET /api/certificates/course/:courseId
   */
  static async getCourseCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CertificateService.getCourseCertificates(courseId, page, limit);

      res.status(200).json(paginatedResponse(result.certificates, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get course certificates controller error', error);
      next(error);
    }
  }

  /**
   * Verify certificate
   * GET /api/certificates/verify/:serialNumber
   */
  static async verifyCertificate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { serialNumber } = req.params;

      const result = await CertificateService.verifyCertificate(serialNumber);

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Verify certificate controller error', error);
      next(error);
    }
  }

  /**
   * Update certificate Google Drive link
   * PATCH /api/certificates/:id/drive-link
   */
  static async updateGoogleDriveLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { driveLink } = req.body;

      if (!driveLink) {
        res.status(400).json({
          success: false,
          error: 'Drive link is required'
        });
        return;
      }

      const certificate = await CertificateService.updateGoogleDriveLink(id, driveLink);

      res.status(200).json(successResponse(certificate, 'Google Drive link updated'));
    } catch (error) {
      logger.error('Update Google Drive link controller error', error);
      next(error);
    }
  }

  /**
   * Get batch certificates
   * GET /api/certificates/batch/:batchId
   */
  static async getBatchCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { batchId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await CertificateService.getBatchCertificates(batchId, page, limit);

      res.status(200).json(paginatedResponse(result.certificates, result.total, result.page, result.limit));
    } catch (error) {
      logger.error('Get batch certificates controller error', error);
      next(error);
    }
  }

  /**
   * Get my certificates (current user)
   * GET /api/certificates/my
   */
  static async getMyCertificates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req as any).user?.userId;

      const certificates = await CertificateService.getStudentCertificates(studentId);

      res.status(200).json(successResponse(certificates));
    } catch (error) {
      logger.error('Get my certificates controller error', error);
      next(error);
    }
  }
}

export default CertificateController;