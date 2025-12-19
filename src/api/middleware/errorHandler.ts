/**
 * Centralized Error Handler
 */

import { ApiError } from '@errors/AppError';

/**
 * Handle API errors with consistent logging and transformation
 */
export function handleApiError(error: unknown, context: string): never {
  console.error(`API Error (${context}):`, error);

  if (error instanceof Error) {
    throw new ApiError(error.message, 'API_ERROR');
  }

  throw new ApiError('An unexpected error occurred', 'UNKNOWN_ERROR');
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
