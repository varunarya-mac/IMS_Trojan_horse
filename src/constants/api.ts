/**
 * API-related constants
 */

export const API_TIMEOUT = 30000; // 30 seconds

export const REALTIME_SUBSCRIPTION_TIMEOUT = 200 * 1000; // 200 seconds

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
