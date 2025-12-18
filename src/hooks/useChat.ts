/**
 * Chat Hooks
 * React Query hooks for chat data fetching
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '../services/chatApi';
import { useRealtimeMessageManager } from './useRealtimeMessage';
import type {
  SendMessageRequest,
  CreateChatRequest,
  GetChatResponse,
  RealtimeMessagePayload,
  Message,
} from '../types/chat';
import { isProcessingMessage } from '../types/chat';

// Query keys
export const chatKeys = {
  all: ['chats'] as const,
  list: () => [...chatKeys.all, 'list'] as const,
  listPaginated: (limit: number) => [...chatKeys.all, 'list', 'paginated', limit] as const,
  detail: (chatId: string) => [...chatKeys.all, 'detail', chatId] as const,
};

/**
 * Fetch list of chats for current user (simple - for sidebar)
 */
export function useChats(limit: number = 20) {
  return useQuery({
    queryKey: chatKeys.list(),
    queryFn: () => chatApi.listChats(limit, 0),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch paginated list of chats with infinite scroll / load more
 */
export function useChatsPaginated(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: chatKeys.listPaginated(limit),
    queryFn: ({ pageParam = 0 }) => chatApi.listChats(limit, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((acc, page) => acc + page.chats.length, 0);
      // If we got fewer items than the limit, there are no more pages
      if (lastPage.chats.length < limit) {
        return undefined;
      }
      // If total fetched equals total, no more pages
      if (totalFetched >= lastPage.total) {
        return undefined;
      }
      // Return the next offset
      return totalFetched;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch single chat with all messages
 */
export function useChat(chatId: string | null) {
  return useQuery({
    queryKey: chatKeys.detail(chatId || ''),
    queryFn: () => chatApi.getChat(chatId!),
    enabled: !!chatId,
  });
}

/**
 * Create new chat mutation
 */
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data?: CreateChatRequest) => chatApi.createChat(data),
    onSuccess: () => {
      // Invalidate chat list to show new chat
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });
    },
  });
}

/**
 * Send message mutation with Realtime subscription
 * Backend returns HTTP 202 with placeholder, then processes asynchronously.
 * This hook subscribes to Realtime to get the actual AI response.
 */
export function useSendMessage() {
  const queryClient = useQueryClient();
  const realtimeManager = useRealtimeMessageManager();

  /**
   * Update a message in the React Query cache
   */
  const updateMessageInCache = (chatId: string, updatedMessage: RealtimeMessagePayload) => {
    console.log('------update message------------------', JSON.stringify(updatedMessage));
    queryClient.setQueryData<GetChatResponse>(
      chatKeys.detail(chatId),
      (oldData) => {
        if (!oldData) return oldData;

        // Ensure messages is an array
        const existingMessages = Array.isArray(oldData.messages) ? oldData.messages : [];

        const updatedMessages = existingMessages.map((msg: Message): Message =>
          msg.id === updatedMessage.$id
            ? {
                ...msg,
                content: updatedMessage.content,
                contentType: updatedMessage.contentType as Message['contentType'],
                summaryData: updatedMessage.summaryData,
                graphImageId: updatedMessage.graphImageId,
                graphUrl: updatedMessage.graphUrl,
                processingTime: updatedMessage.processingTime,
                $updatedAt: updatedMessage.$updatedAt,
              }
            : msg
        );

        return {
          ...oldData,
          messages: updatedMessages,
        };
      }
    );
  };

  return useMutation({
    mutationFn: ({
      chatId,
      data,
    }: {
      chatId: string;
      data: SendMessageRequest;
    }) => chatApi.sendMessage(chatId, data),
    onSuccess: (result, variables) => {
      // Update cache directly with the new messages (avoids refetch delay)
      queryClient.setQueryData<GetChatResponse>(
        chatKeys.detail(variables.chatId),
        (oldData) => {
          // If no existing data (new chat), create initial structure
          if (!oldData) {
            return {
              chat: {
                $id: variables.chatId,
                userId: '',
                title: 'New Chat',
                status: 'active' as const,
                messageCount: 2,
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
              },
              messages: [result.userMessage, result.assistantMessage],
            };
          }
          // Ensure messages is an array (might be null/undefined)
          const existingMessages = Array.isArray(oldData.messages) ? oldData.messages : [];
          // Append to existing messages
          return {
            ...oldData,
            messages: [
              ...existingMessages,
              result.userMessage,
              result.assistantMessage,
            ],
          };
        }
      );

      // Also refresh chat list (for updated timestamps/titles)
      queryClient.invalidateQueries({ queryKey: chatKeys.list() });

      // Check if the assistant message is a placeholder (async processing)
      if (result.assistantMessage && isProcessingMessage(result.assistantMessage.content)) {
        console.log('----------id-----------', result.assistantMessage);
        const messageId = result.assistantMessage.id;
        console.log('----------id---22--------', messageId);

        // Subscribe to realtime updates for this message
        realtimeManager.subscribe(
          messageId,
          // onUpdate - when we receive the real content
          (updatedMessage) => {
            updateMessageInCache(variables.chatId, updatedMessage);
            // Cache is already updated manually, no need to refetch from server
            // (refetching would overwrite cache with potentially stale server data)
          },
          // onError
          (error) => {
            console.error('Realtime subscription error:', error);
          },
          // onTimeout
          () => {
            console.warn('Message processing timed out. Refreshing chat data...');
            // On timeout, refresh the chat data in case the message was updated
            queryClient.invalidateQueries({
              queryKey: chatKeys.detail(variables.chatId),
            });
          }
        );
      }
    },
  });
}

/**
 * Delete chat mutation
 */
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      // Invalidate all chat queries
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

/**
 * Upload file mutation
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => chatApi.uploadFile(file, onProgress),
  });
}

/**
 * Invalidate all chat queries - useful after bulk operations
 */
export function useInvalidateChatQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: chatKeys.all,
    });
  };
}
