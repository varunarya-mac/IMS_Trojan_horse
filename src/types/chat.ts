/**
 * Chat Types
 * TypeScript interfaces for chat functionality
 */

// ============================================
// Core Chat Types
// ============================================

/**
 * Message role enum
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Message content type enum
 */
export type MessageContentType = 'text' | 'summary' | 'graph' | 'error';

/**
 * Datapoint status enum
 */
export type DatapointStatus = 'Critical' | 'Warning' | 'Okay';

export interface Chat {
  $id: string;
  userId: string;
  title: string;
  status: 'active' | 'processing' | 'error';
  csvFileId?: string;
  csvFileName?: string;
  deviceType?: 'pack' | 'case' | 'mixed';
  messageCount: number;
  $createdAt: string;
  $updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  contentType: MessageContentType;
  summaryData?: SummaryData;
  graphImageId?: string;
  graphUrl?: string;
  processingTime?: number;
  $createdAt: string;
  $updatedAt?: string;
}

export interface UserMessage extends Message {
  role: 'user';
  csvFileId?: string;
  csvFileName?: string;
}

export interface AssistantMessage extends Message {
  role: 'assistant';
  contentType: MessageContentType;
  summaryData?: SummaryData;
  graphImageId?: string;
  graphUrl?: string;
}

// ============================================
// Summary Data Types
// ============================================

export interface SummaryData {
  summary: string;
  recommendations: Recommendation[];
  datapoints: Datapoint[];
  graphConfig?: GraphConfig;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'maintenance' | 'configuration' | 'monitoring' | 'immediate';
  actionLabel: string;
}

export interface Datapoint {
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status?: DatapointStatus;
}

export interface GraphConfig {
  type: 'line' | 'bar' | 'scatter';
  title: string;
  xColumn: string;
  yColumns: string[];
  xLabel?: string;
  yLabel?: string;
  showAnomalies: boolean;
  timeRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// API Request/Response Types
// ============================================

export interface CreateChatRequest {
  title?: string;
  initialMessage?: string;
  csvFileId?: string;
  csvFileName?: string;
}

export interface CreateChatResponse {
  chatId: string;
  title: string;
  status: 'active' | 'processing' | 'error';
  createdAt: string;
}

export interface ListChatsResponse {
  chats: Chat[];
  total: number;
}

export interface GetChatResponse {
  chat: Chat;
  messages: Message[];
}

export interface SendMessageRequest {
  content: string;
  csvFileId?: string;
  csvFileName?: string;
  csvFileSize?: number;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: AssistantMessage;
  processingTime: number;
}

export interface UploadFileResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
}

// ============================================
// API Response Wrapper (matches alarmApi pattern)
// ============================================

export interface ChatApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    suggestion?: string;
    details?: unknown;
  };
}

// ============================================
// UI State Types
// ============================================

export interface ChatState {
  currentChatId: string | null;
  chats: Chat[];
  messages: Message[];
  isLoading: boolean;
  isSending: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  pendingFile: PendingFile | null;
}

export interface PendingFile {
  file: File;
  fileId?: string;
  fileName: string;
  fileSize: number;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
}

// ============================================
// Async Processing Types (for Appwrite Realtime)
// ============================================

/**
 * HTTP 202 Accepted response for async message processing
 * Backend returns this immediately, then processes the AI response asynchronously
 */
export interface SendMessageAsyncResponse {
  userMessage: Message;
  assistantMessage: AssistantMessage; // Contains placeholder content
  processingTime: number;
  isAsync: true;
}

/**
 * Placeholder messages used by backend when async processing
 */
export const PROCESSING_MESSAGES = {
  ANALYZING: 'Analyzing your data...',
  PROCESSING: 'Processing your request...',
  GENERATING: 'Generating response...',
} as const;

export type ProcessingMessageContent = (typeof PROCESSING_MESSAGES)[keyof typeof PROCESSING_MESSAGES];

/**
 * Keywords that indicate a message is still being processed
 */
const PROCESSING_KEYWORDS = ['analyzing', 'processing', 'generating'];

/**
 * Check if a message content is a processing placeholder
 * Returns true if content contains any processing keyword (case-insensitive)
 */
export function isProcessingMessage(content: string): boolean {
  if (!content) return false;
  const lowerContent = content.toLowerCase();
  return PROCESSING_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

/**
 * Realtime event payload when message document updates
 */
export interface RealtimeMessagePayload {
  $id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  contentType: 'text' | 'analysis' | 'error';
  summaryData?: SummaryData;
  graphImageId?: string;
  graphUrl?: string;
  processingTime?: number;
  $createdAt: string;
  $updatedAt: string;
}

/**
 * Appwrite Realtime event structure
 */
export interface RealtimeEvent<T = unknown> {
  events: string[];
  channels: string[];
  timestamp: number;
  payload: T;
}
