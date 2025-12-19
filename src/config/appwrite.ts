/**
 * Appwrite Configuration
 * Uses environment variables with fallbacks for development
 *
 * To configure, copy .env.example to .env and set your values
 */
export const APPWRITE_CONFIG = {
  // Appwrite Cloud endpoint
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  // Appwrite Project ID
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '6936b8d8003e749d06d2',
  // Function IDs
  fnAlarmManagement: import.meta.env.VITE_FN_ALARM_MANAGEMENT || 'fn-alarm-management',
  fnChatApi: import.meta.env.VITE_FN_CHAT_API || 'fn-chat-api',
  fnChatProcessor: import.meta.env.VITE_FN_CHAT_PROCESSOR || 'fn-chat-processor',
  fnVectorSearch: import.meta.env.VITE_FN_VECTOR_SEARCH || 'fn-vector-search',
  fnJobWorker: import.meta.env.VITE_FN_JOB_WORKER || 'fn-job-worker',
  // Storage bucket
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || 'refrigeration-files',
  // Database config for Realtime subscriptions
  databaseId: import.meta.env.VITE_DATABASE_ID || 'iot_alarm_management',
  collections: {
    messages: import.meta.env.VITE_COLLECTION_MESSAGES || 'messages',
  },
} as const;

// Type for environment validation
export type AppwriteConfig = typeof APPWRITE_CONFIG;
