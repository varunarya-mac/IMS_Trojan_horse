/**
 * ChatContainer Component
 * Main chat layout that coordinates all chat components
 */

import { useState, useCallback, useEffect } from 'react';
import { MainLayout } from '@components/layout';
import { useChatContext } from '@context/ChatContext';
import { useChat, useCreateChat, useSendMessage, useUploadFile } from '@hooks/useChat';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import type { Message, Recommendation, PendingFile } from '@types/chat';
import { isProcessingMessage } from '@types/chat';

const ChatContainer = () => {
  const {
    currentChatId,
    setCurrentChatId,
    pendingFile,
    setPendingFile,
    clearPendingFile,
    optimisticMessages,
    addOptimisticMessage,
    clearOptimisticMessages,
    isProcessing,
    setProcessingMessageId,
    clearProcessingMessage,
  } = useChatContext();

  const [error, setError] = useState<string | null>(null);

  // Fetch current chat data
  const { data: chat, isLoading: isChatLoading } = useChat(currentChatId || '');

  // Mutations
  const createChat = useCreateChat();
  const sendMessage = useSendMessage();
  const uploadFile = useUploadFile();

  // Combine real messages with optimistic messages
  const messages: Message[] = [
    ...(chat?.messages || []),
    ...optimisticMessages,
  ];

  const isLoading = sendMessage.isPending || createChat.isPending;

  // Track processing state from messages
  // When we detect a processing message, set the processing state
  // When it's no longer processing, clear the state
  useEffect(() => {
    const processingMsg = messages.find(
      (msg) => msg.role === 'assistant' && isProcessingMessage(msg.content)
    );

    if (processingMsg) {
      setProcessingMessageId(processingMsg.id);
    } else {
      clearProcessingMessage();
    }
  }, [messages, setProcessingMessageId, clearProcessingMessage]);

  // Input is disabled when loading OR when a message is being processed
  const isInputDisabled = isLoading || isProcessing;

  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string, file?: PendingFile) => {
    if (!content.trim() && !file) return;

    setError(null);

    try {
      let chatId = currentChatId;
      let fileId: string | undefined;
      let fileName: string | undefined;

      // Upload file if present
      if (file) {
        const uploadResult = await uploadFile.mutateAsync({
          file: file.file,
          onProgress: (progress) => {
            setPendingFile({ ...file, uploadProgress: progress, status: 'uploading' });
          },
        });
        fileId = uploadResult.fileId;
        fileName = file.file.name;
        clearPendingFile();
      }

      // Create new chat if needed
      if (!chatId) {
        const newChatResponse = await createChat.mutateAsync({});
        chatId = newChatResponse.chatId;
        setCurrentChatId(chatId);
        // Small delay to allow backend consistency (Appwrite eventual consistency)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Guard: Ensure chatId exists before sending message
      if (!chatId) {
        setError('Failed to create chat. Please try again.');
        return;
      }

      // Add optimistic message
      const optimisticUserMessage: Message = {
        id: `optimistic-${Date.now()}`,
        chatId,
        role: 'user',
        content,
        contentType: 'text',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };
      addOptimisticMessage(optimisticUserMessage);

      // Send message with retry logic for eventual consistency
      const sendWithRetry = async (retries = 2): Promise<void> => {
        try {
          await sendMessage.mutateAsync({
            chatId: chatId!,
            data: {
              content,
              csvFileId: fileId,
              csvFileName: fileName,
            },
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : '';
          // Retry if chat not found (eventual consistency issue)
          if (retries > 0 && errorMessage.includes('not found')) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return sendWithRetry(retries - 1);
          }
          throw err;
        }
      };

      await sendWithRetry();

      clearOptimisticMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      clearOptimisticMessages();
    }
  }, [
    currentChatId,
    createChat,
    sendMessage,
    uploadFile,
    setCurrentChatId,
    setPendingFile,
    clearPendingFile,
    addOptimisticMessage,
    clearOptimisticMessages,
  ]);


  // Handle recommendation action
  const handleRecommendationAction = useCallback((recommendation: Recommendation) => {
    // Could navigate to relevant page or trigger specific action
    console.log('Recommendation action:', recommendation);
    // Could potentially trigger a message send or navigate to relevant content
  }, []);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    setError(null);
  }, []);

  // Handle file selection - convert File to PendingFile
  const handleFileSelect = useCallback((file: File) => {
    const pendingFileData: PendingFile = {
      file,
      fileName: file.name,
      fileSize: file.size,
      uploadProgress: 0,
      status: 'pending',
    };
    setPendingFile(pendingFileData);
  }, [setPendingFile]);

  const hasMessages = messages.length > 0;

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Error display */}
        {error && (
          <div className="px-4 pt-4">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Main content area */}
        {!hasMessages && !isChatLoading ? (
          <EmptyState />
        ) : (
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onRecommendationAction={handleRecommendationAction}
          />
        )}

        {/* Input area */}
        <div className="p-4">
          <div className="max-w-[900px] mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              pendingFile={pendingFile}
              onFileSelect={handleFileSelect}
              onFileRemove={clearPendingFile}
              disabled={isInputDisabled}
              placeholder={
                isProcessing
                  ? 'Waiting for response...'
                  : hasMessages
                    ? 'Ask a follow-up question...'
                    : 'Ask anything related to refrigerator devices'
              }
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatContainer;
