/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * Paginated Response Format
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Error Response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Validation Error Response
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Request with user context
 */
export interface AuthenticatedRequest {
  userId: string;
  userRole: 'student' | 'admin';
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Login Response
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    fullName: string;
    email: string;
    username: string;
    role: 'student' | 'admin';
    avatar?: string;
  };
}

/**
 * Registration Response
 */
export interface RegisterResponse {
  user: {
    _id: string;
    fullName: string;
    email: string;
    username: string;
    role: 'student';
  };
  message: string;
}

/**
 * Token Response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * User Profile Response
 */
export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Course Response
 */
export interface CourseResponse {
  _id: string;
  title: string;
  description: string;
  level: string;
  price: number;
  instructorName: string;
  duration: number;
  modules: string[];
  capacity: number;
  enrollmentCount: number;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Enrollment Response
 */
export interface EnrollmentResponse {
  _id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledDate: string;
  progress: number;
  completedDate?: string;
  certificateId?: string;
}

/**
 * Certificate Response
 */
export interface CertificateResponse {
  _id: string;
  serialNumber: string;
  courseName: string;
  userName: string;
  issueDate: string;
  googleDriveLink: string;
}

/**
 * Payment Response
 */
export interface PaymentResponse {
  _id: string;
  enrollmentId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  midtransToken?: string;
  redirectUrl?: string;
  createdAt: string;
}

/**
 * Analytics Response
 */
export interface AnalyticsResponse {
  totalEnrollments: number;
  totalRevenue: number;
  completionRate: number;
  activeUsers: number;
  topCourses: {
    courseId: string;
    title: string;
    enrollments: number;
  }[];
}