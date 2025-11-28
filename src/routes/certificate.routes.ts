import { Router } from 'express';
import { CertificateController } from '../controllers';
import { authenticate, authorize } from '../middleware';

const router = Router();

/**
 * Certificate Routes
 * Base: /api/certificates
 */

// Public routes
router.get('/verify/:serialNumber', CertificateController.verifyCertificate);

// Protected routes
router.post('/:enrollmentId', authenticate, CertificateController.generateCertificate);
router.get('/my', authenticate, CertificateController.getMyCertificates);
router.get('/:id', authenticate, CertificateController.getCertificateById);
router.get('/student/:studentId', authenticate, CertificateController.getStudentCertificates);
router.get('/course/:courseId', authenticate, CertificateController.getCourseCertificates);
router.get('/batch/:batchId', authenticate, CertificateController.getBatchCertificates);
router.patch('/:id/drive-link', authenticate, CertificateController.updateGoogleDriveLink);

// Admin only routes
router.post('/batch', authenticate, authorize(['admin']), CertificateController.createCertificateBatch);

export default router;