import multer from 'multer';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Configure multer for file uploads
 * Uses memory storage for temp file handling
 */
const storage = multer.memoryStorage();

/**
 * File filter for images only
 */
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

  // Check MIME type
  if (!allowedMimes.includes(file.mimetype)) {
    const error = new Error(`Invalid file type: ${file.mimetype}`);
    logger.warn(`Upload rejected: Invalid MIME type ${file.mimetype}`);
    return cb(error);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExts.includes(ext)) {
    const error = new Error(`Invalid file extension: ${ext}`);
    logger.warn(`Upload rejected: Invalid extension ${ext}`);
    return cb(error);
  }

  cb(null, true);
};

/**
 * Multer configuration
 */
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 10 // Max 10 files per request
  }
});

/**
 * Single file upload middleware
 */
export const uploadSingleMiddleware = uploadMiddleware.single('file');

/**
 * Multiple files upload middleware
 */
export const uploadMultipleMiddleware = uploadMiddleware.array('files', 10);

/**
 * Error handling for multer
 */
export const handleUploadError = (error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    logger.error('Multer error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 5MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum is 10 files'
      });
    }
  }

  if (error) {
    logger.error('Upload error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Upload failed'
    });
  }

  next();
};