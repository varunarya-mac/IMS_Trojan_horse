/**
 * Processing and UI message constants
 */

export const PROCESSING_MESSAGES = {
  ANALYZING: 'Analyzing your data...',
  PROCESSING: 'Processing your request...',
  GENERATING: 'Generating response...',
} as const;

export const PROCESSING_KEYWORDS = ['analyzing', 'processing', 'generating'] as const;

export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;
