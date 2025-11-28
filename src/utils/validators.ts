/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * URL validation
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Mongo ObjectId validation
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Phone number validation (Indonesia)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  page?: number,
  limit?: number
): { page: number; limit: number } => {
  const parsedPage = Math.max(1, page ? Math.floor(page) : 1);
  const parsedLimit = Math.min(100, Math.max(1, limit ? Math.floor(limit) : 10));
  
  return { page: parsedPage, limit: parsedLimit };
};

/**
 * Validate enum value
 */
export const isValidEnum = (value: string, enumValues: string[]): boolean => {
  return enumValues.includes(value);
};

/**
 * Validate course level
 */
export const isValidCourseLevel = (level: string): boolean => {
  const validLevels = ['PAUD', 'TK', 'SD', 'SMP', 'SMA', 'UMUM'];
  return validLevels.includes(level);
};

/**
 * Validate enrollment status
 */
export const isValidEnrollmentStatus = (status: string): boolean => {
  const validStatuses = ['pending_payment', 'active', 'completed', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Validate payment status
 */
export const isValidPaymentStatus = (status: string): boolean => {
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  return validStatuses.includes(status);
};

/**
 * Validate user role
 */
export const isValidUserRole = (role: string): boolean => {
  const validRoles = ['student', 'admin'];
  return validRoles.includes(role);
};

/**
 * Validate help category
 */
export const isValidHelpCategory = (category: string): boolean => {
  const validCategories = ['account', 'course', 'enrollment', 'payment', 'certificate', 'technical', 'other'];
  return validCategories.includes(category);
};

/**
 * Validate progress (0-100)
 */
export const isValidProgress = (progress: number): boolean => {
  return progress >= 0 && progress <= 100 && Number.isInteger(progress);
};

/**
 * Validate price (non-negative)
 */
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && !Number.isNaN(price);
};

/**
 * Validate capacity
 */
export const isValidCapacity = (capacity: number): boolean => {
  return capacity >= 1 && capacity <= 500 && Number.isInteger(capacity);
};

/**
 * Validate duration
 */
export const isValidDuration = (duration: number): boolean => {
  return duration >= 1 && Number.isInteger(duration);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000); // Limit length
};

/**
 * Escape HTML characters
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export default {
  isValidEmail,
  isValidUrl,
  isValidObjectId,
  isValidPhoneNumber,
  validatePagination,
  isValidEnum,
  isValidCourseLevel,
  isValidEnrollmentStatus,
  isValidPaymentStatus,
  isValidUserRole,
  isValidHelpCategory,
  isValidProgress,
  isValidPrice,
  isValidCapacity,
  isValidDuration,
  sanitizeString,
  escapeHtml
};