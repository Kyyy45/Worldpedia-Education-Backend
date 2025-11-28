/**
 * Application Constants
 */
export const CONSTANTS = {
  // API Response
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500
  },

  // User Roles
  ROLES: {
    STUDENT: 'student',
    ADMIN: 'admin'
  },

  // Enrollment Status
  ENROLLMENT_STATUS: {
    PENDING_PAYMENT: 'pending_payment',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },

  // Certificate Status
  CERTIFICATE_STATUS: {
    AVAILABLE: 'available',
    ASSIGNED: 'assigned',
    ACCESSED: 'accessed'
  },

  // Payment Status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },

  // Payment Methods
  PAYMENT_METHODS: {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    BANK_TRANSFER: 'bank_transfer',
    E_WALLET: 'e_wallet'
  },

  // Course Levels
  COURSE_LEVELS: {
    PAUD: 'PAUD',
    TK: 'TK',
    SD: 'SD',
    SMP: 'SMP',
    SMA: 'SMA',
    UMUM: 'UMUM'
  },

  // Help Categories
  HELP_CATEGORIES: {
    ACCOUNT: 'account',
    COURSE: 'course',
    ENROLLMENT: 'enrollment',
    PAYMENT: 'payment',
    CERTIFICATE: 'certificate',
    TECHNICAL: 'technical',
    OTHER: 'other'
  },

  // Form Field Types
  FORM_FIELD_TYPES: {
    TEXT: 'text',
    EMAIL: 'email',
    NUMBER: 'number',
    DATE: 'date',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    SELECT: 'select',
    TEXTAREA: 'textarea'
  },

  // Analytics Types
  ANALYTICS_TYPES: {
    ENROLLMENT: 'enrollment',
    REVENUE: 'revenue',
    COMPLETION: 'completion',
    USER: 'user'
  },

  // Rate Limiting
  RATE_LIMITS: {
    LOGIN: {
      attempts: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    REGISTER: {
      attempts: 3,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    VERIFY_CODE: {
      attempts: 5,
      windowMs: 15 * 60 * 1000 // 15 minutes
    },
    RESEND_CODE: {
      attempts: 3,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    FORGOT_PASSWORD: {
      attempts: 3,
      windowMs: 60 * 60 * 1000 // 1 hour
    },
    GENERAL: {
      attempts: 100,
      windowMs: 15 * 60 * 1000 // 15 minutes
    }
  },

  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 12,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true
  },

  // Token Expiry
  TOKEN_EXPIRY: {
    ACCESS: '15m',
    REFRESH: '7d',
    ACTIVATION: '24h',
    RESET_PASSWORD: '1h'
  },

  // Account Lockout
  ACCOUNT_LOCKOUT: {
    MAX_ATTEMPTS: 5,
    DURATION: 30 * 60 * 1000 // 30 minutes
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Course
  COURSE: {
    MIN_CAPACITY: 1,
    MAX_CAPACITY: 500,
    MIN_MODULES: 1,
    MAX_MODULES: 10
  },

  // Form
  FORM: {
    MIN_FIELDS: 1,
    MAX_FIELDS: 50,
    MAX_KEYWORDS: 10
  }
};

export default CONSTANTS;