import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../types/error.types';

/**
 * General rate limiter (100 requests per 15 minutes)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many requests, please try again later');
  }
});

/**
 * Auth endpoints rate limiter (5 attempts per 15 minutes for login)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many login attempts. Please try again in 15 minutes.');
  }
});

/**
 * Register endpoint rate limiter (3 attempts per hour)
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many accounts created from this IP, please try again later.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many registration attempts. Please try again in 1 hour.');
  }
});

/**
 * Email verification code limiter (5 attempts per 15 minutes)
 */
export const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many verification attempts.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many verification attempts. Please try again in 15 minutes.');
  }
});

/**
 * Resend code limiter (3 attempts per hour)
 */
export const resendCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many code resend requests.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many resend requests. Please try again in 1 hour.');
  }
});

/**
 * Forgot password limiter (3 attempts per hour)
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts
  message: 'Too many password reset requests.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many password reset requests. Please try again in 1 hour.');
  }
});

/**
 * Payment endpoint limiter (10 requests per hour)
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests
  message: 'Too many payment requests.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Too many payment requests. Please try again later.');
  }
});

/**
 * API endpoint limiter (per user, 50 requests per 15 minutes)
 */
export const userApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.userId || req.ip || 'unknown';
  },
  message: 'Too many API requests from this user.',
  handler: (_req, _res) => {
    throw new TooManyRequestsError('Rate limit exceeded. Please try again later.');
  }
});

export default {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  verifyCodeLimiter,
  resendCodeLimiter,
  forgotPasswordLimiter,
  paymentLimiter,
  userApiLimiter
};