/**
 * Register Request DTO
 */
export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Login Request DTO
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/**
 * Refresh Token Request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Verify Email Request
 */
export interface VerifyEmailRequest {
  email: string;
  activationCode: string;
}

/**
 * Resend Verification Code Request
 */
export interface ResendCodeRequest {
  email: string;
}

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Change Password Request
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: 'student' | 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

/**
 * OAuth User Info
 */
export interface OAuthUserInfo {
  id: string;
  displayName: string;
  email: string;
  photo?: string;
  provider: 'google' | 'facebook';
}

/**
 * Auth Token Pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Activation Code Info
 */
export interface ActivationCodeInfo {
  code: string;
  email: string;
  expiresAt: Date;
  attempts: number;
}

/**
 * Password Reset Token Info
 */
export interface PasswordResetTokenInfo {
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
}