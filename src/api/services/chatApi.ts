/**
 * Chat API Service
 * Handles communication with the fn-chat-api Appwrite function
 */

import { Functions, Storage, ID } from 'appwrite';
import { APPWRITE_CONFIG } from '@config/appwrite';
// Use the authenticated client from authService (shares session)
import { client } from './authService';
import type {
  ChatApiResponse,
  CreateChatRequest,
  CreateChatResponse,
  ListChatsResponse,
  GetChatResponse,
  SendMessageRequest,
  SendMessageResponse,
  UploadFileResponse,
} from '@types/chat';

// HTTP method type for Appwrite function execution
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Use the shared authenticated client for functions and storage
const functions = new Functions(client);
const storage = new Storage(client);

// Export the authenticated client for Realtime subscriptions in hooks
export const appwriteClient = client;

// Chat API Function ID (replace with actual function ID when deployed)
const CHAT_FUNCTION_ID =  APPWRITE_CONFIG.fnChatApi; //'fn-chat-api';

// Storage bucket for CSV files and graphs
const STORAGE_BUCKET_ID = APPWRITE_CONFIG.storageBucket;

/**
 * Execute an Appwrite function with the given path and method
 */
async function executeFunction<T>(
  path: string,
  method: HttpMethod = 'GET',
  body?: object
): Promise<T> {
  try {
    const execution = await functions.createExecution(
      CHAT_FUNCTION_ID,
      body ? JSON.stringify(body) : '',
      false, // async = false (wait for response)
      path,
      method as Parameters<typeof functions.createExecution>[4]
    );

    const response = JSON.parse(execution.responseBody) as ChatApiResponse<T>;

    if (!response.success) {
      throw new Error(response.error?.message || 'API request failed');
    }

    return response.data as T;
  } catch (error) {
    console.error(`Chat API error (${method} ${path}):`, error);
    throw error;
  }
}

/**
 * Chat API Service
 */
export const chatApi = {
  // ==========================================
  // Chat Operations
  // ==========================================

  /**
   * Create a new chat session
   */
  async createChat(data?: CreateChatRequest): Promise<CreateChatResponse> {
    return executeFunction<CreateChatResponse>('/chats', 'POST', data || {});
  },

  /**
   * List all chats for current user with pagination
   */
  async listChats(limit: number = 20, offset: number = 0): Promise<ListChatsResponse> {
    // Backend response structure (different from frontend types)
    interface BackendChat {
      id: string;
      title: string;
      status: string;
      deviceType: string | null;
      csvFileName: string | null;
      messageCount: number;
      lastMessageAt: string;
      createdAt: string;
      updatedAt: string;
    }

    // interface BackendListResponse {
    //   data: BackendChat[];
    //   meta: {
    //     total: number;
    //     limit: number;
    //     offset: number;
    //   };
    // }

    // Backend returns array directly, not wrapped in { data, meta }
    const response = await executeFunction<BackendChat[]>(
      `/chats?limit=${limit}&offset=${offset}`,
      'GET'
    );
    console.log('-----chat list------', response);
    // Transform backend response to match frontend ListChatsResponse
    return {
      chats: response.map((chat) => ({
        $id: chat.id,
        userId: '',
        title: chat.title,
        status: (chat.status === 'completed' ? 'active' : chat.status) as 'active' | 'processing' | 'error',
        csvFileName: chat.csvFileName || undefined,
        deviceType: chat.deviceType as 'pack' | 'case' | 'mixed' | undefined,
        messageCount: chat.messageCount,
        $createdAt: chat.createdAt,
        $updatedAt: chat.updatedAt,
      })),
      total: response.length,
    };
  },

  /**
   * Get chat with all messages
   * Fetches chat details and messages separately, then combines them
   */
  async getChat(chatId: string): Promise<GetChatResponse> {
    // Backend chat response structure
    interface BackendChatDetail {
      id: string;
      userId: string;
      title: string;
      status: string;
      csvFileId?: string;
      csvFileName?: string;
      deviceType: string | null;
      createdAt: string;
      updatedAt: string;
    }

    // Backend message structure
    interface BackendMessage {
      id: string;
      chatId: string;
      role: string;
      content: string;
      contentType: string;
      summaryData?: BackendSummaryData;
      graphImageId?: string;
      graphUrl?: string;
      processingTime?: number;
      createdAt: string;
      updatedAt?: string;
    }

    // Backend summaryData structure (different from frontend)
    interface BackendSummaryData {
      summary?: {
        title?: string;
        description?: string;
        recommendedActions?: string[];
      };
      recommendations?: Array<{
        title: string;
        description: string;
        confidence?: number;
        recommendedActions?: string[];
        evidenceTrail?: unknown[];
      }>;
      datapoints?: Array<{
        name: string;
        metric: string;
        status?: string;
        history?: unknown;
      }>;
      graphRecommendation?: unknown;
    }

    // Transform backend summaryData to frontend format
    const transformSummaryData = (backendData?: BackendSummaryData) => {
      if (!backendData) return undefined;

      // Map confidence to priority (higher confidence = higher priority)
      const getPriority = (confidence?: number): 'high' | 'medium' | 'low' => {
        if (!confidence) return 'medium';
        if (confidence >= 70) return 'high';
        if (confidence >= 50) return 'medium';
        return 'low';
      };

      // Parse metric string to extract value and unit (e.g., "-16.88 °C" -> { value: "-16.88", unit: "°C" })
      const parseMetric = (metric: string): { value: string; unit: string } => {
        const parts = metric.trim().split(/\s+/);
        if (parts.length >= 2) {
          return { value: parts[0], unit: parts.slice(1).join(' ') };
        }
        return { value: metric, unit: '' };
      };

      return {
        // Convert summary object to string
        summary: backendData.summary?.description || '',
        // Transform recommendations
        recommendations: backendData.recommendations?.map((rec, index) => ({
          id: `rec-${index}`,
          title: rec.title,
          description: rec.description,
          priority: getPriority(rec.confidence),
          category: 'monitoring' as const, // Default category since backend doesn't provide it
          actionLabel: rec.recommendedActions?.[0] || 'View Details',
        })) || [],
        // Transform datapoints
        datapoints: backendData.datapoints?.map((dp) => {
          const { value, unit } = parseMetric(dp.metric);
          return {
            label: dp.name,
            value,
            unit,
            trend: 'stable' as const, // Default since backend doesn't provide trend
            status: (dp.status || 'Okay') as 'Critical' | 'Warning' | 'Okay',
          };
        }) || [],
      };
    };

    // Fetch chat and messages in parallel
    const [chatResponse, messagesResponse] = await Promise.all([
      executeFunction<BackendChatDetail>(`/chats/${chatId}`, 'GET'),
      executeFunction<BackendMessage[]>(`/chats/${chatId}/messages`, 'GET'),
    ]);

    console.log('-----chat detail------', chatResponse);
    console.log('-----messages------', messagesResponse);

    // Transform and return combined response
    return {
      chat: {
        $id: chatResponse.id,
        userId: chatResponse.userId,
        title: chatResponse.title,
        status: (chatResponse.status === 'completed' ? 'active' : chatResponse.status) as 'active' | 'processing' | 'error',
        csvFileId: chatResponse.csvFileId,
        csvFileName: chatResponse.csvFileName || undefined,
        deviceType: chatResponse.deviceType as 'pack' | 'case' | 'mixed' | undefined,
        messageCount: messagesResponse.length,
        $createdAt: chatResponse.createdAt,
        $updatedAt: chatResponse.updatedAt,
      },
      messages: messagesResponse.map((msg) => ({
        id: msg.id,
        chatId: msg.chatId,
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
        contentType: msg.contentType as 'text' | 'summary' | 'graph' | 'error',
        summaryData: transformSummaryData(msg.summaryData),
        graphImageId: msg.graphImageId,
        graphUrl: msg.graphUrl,
        processingTime: msg.processingTime,
        $createdAt: msg.createdAt,
        $updatedAt: msg.updatedAt,
      })),
    };
  },

  /**
   * Delete a chat
   */
  async deleteChat(chatId: string): Promise<{ message: string }> {
    return executeFunction<{ message: string }>(`/chats/${chatId}`, 'DELETE');
  },

  // ==========================================
  // Message Operations
  // ==========================================

  /**
   * Send a message to a chat (main endpoint)
   * Backend processes asynchronously - returns HTTP 202 with placeholder.
   * Use Realtime subscription to get the actual AI response.
   */
  async sendMessage(
    chatId: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> {
    return executeFunction<SendMessageResponse>(
      `/chats/${chatId}/messages`,
      'POST',
      data
    );
  },

  // ==========================================
  // File Operations
  // ==========================================

  /**
   * Upload CSV file to storage
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadFileResponse> {
    try {
      const response = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file,
        undefined,
        (progress) => {
          if (onProgress) {
            const percent = Math.round(
              (progress.chunksUploaded / progress.chunksTotal) * 100
            );
            onProgress(percent);
          }
        }
      );

      return {
        fileId: response.$id,
        fileName: response.name,
        fileSize: response.sizeOriginal,
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  },

  /**
   * Get file view URL (for graphs and CSVs)
   * Uses Appwrite SDK to generate authenticated URL
   */
  getFileUrl(fileId: string): string {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId).toString();
  },

  /**
   * Get file download URL
   * Uses Appwrite SDK to generate authenticated URL
   */
  getFileDownloadUrl(fileId: string): string {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId).toString();
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch (error) {
      console.error('File delete error:', error);
      throw error;
    }
  },

  /**
   * Download file content as Blob using authenticated request
   * This bypasses CORS issues by using the SDK's authenticated fetch
   */
  async getFileContent(fileId: string): Promise<Blob> {
    try {
      const url = storage.getFileDownload(STORAGE_BUCKET_ID, fileId);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Appwrite-Project': APPWRITE_CONFIG.projectId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
      }

      return response.blob();
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  },
};

export default chatApi;
