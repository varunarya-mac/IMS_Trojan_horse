// Appwrite Configuration
// Replace these values with your Appwrite Cloud credentials
export const APPWRITE_CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1', // Your Appwrite Endpoint
  projectId: '6936b8d8003e749d06d2', // Your Appwrite Project ID
  fnAlarmManagement: "fn-alarm-management",
  fnChatApi: "fn-chat-api",
  fnChatProcessor: "fn-chat-processor",
  fnVectorSearch: "fn-vector-search",
  fnJobWorker: "fn-job-worker",
  storageBucket: "refrigeration-files",
  // Database config for Realtime subscriptions
  databaseId: "iot_alarm_management",
  collections: {
    messages: "messages",
  },
};
