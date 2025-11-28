import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Format success response
 */
export const successResponse = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format paginated success response
 */
export const paginatedResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): ApiResponse<PaginatedResponse<T>> => {
  const pages = Math.ceil(total / limit);
  
  return {
    success: true,
    data: {
      items,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Format error response
 */
export const errorResponse = (
  error: string
): ApiResponse => {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format validation error response
 */
export const validationErrorResponse = (
  errors: Record<string, string>
): ApiResponse => {
  const errorMessages = Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('; ');

  return {
    success: false,
    error: 'Validation failed',
    message: errorMessages,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format created response
 */
export const createdResponse = <T>(
  data: T,
  message: string = 'Created successfully'
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format updated response
 */
export const updatedResponse = <T>(
  data: T,
  message: string = 'Updated successfully'
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
};

/**
 * Format deleted response
 */
export const deletedResponse = (
  message: string = 'Deleted successfully'
): ApiResponse => {
  return {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
};

export default {
  successResponse,
  paginatedResponse,
  errorResponse,
  validationErrorResponse,
  createdResponse,
  updatedResponse,
  deletedResponse
};