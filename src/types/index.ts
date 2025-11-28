/**
 * Central export point for all types
 */

export * from './api.types';
export * from './auth.types';
export * from './request.types';
export * from './error.types';

// Re-export commonly used types
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  ValidationError,
  AuthenticatedRequest,
  LoginResponse,
  RegisterResponse,
  UserProfile,
  CourseResponse,
  EnrollmentResponse,
  CertificateResponse,
  PaymentResponse,
  AnalyticsResponse
} from './api.types';

export type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  VerifyEmailRequest,
  JwtPayload,
  TokenPair
} from './auth.types';

export type {
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateEnrollmentRequest,
  FormFieldDefinition,
  CreateFormRequest,
  FormSubmissionRequest,
  CreatePaymentRequest,
  PaginationQuery,
  SearchQuery,
  FilterOptions
} from './request.types';

export {
  AppError,
  ValidationError as ValidationErrorClass,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  BadGatewayError
} from './error.types';