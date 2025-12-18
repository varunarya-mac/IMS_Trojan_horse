import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import type { Message, PendingFile } from '../types/chat';

interface ChatContextType {
  // Current state
  currentChatId: string | null;
  pendingFile: PendingFile | null;
  optimisticMessages: Message[];

  // Async processing state
  processingMessageId: string | null;
  isProcessing: boolean;

  // Actions
  setCurrentChatId: (chatId: string | null) => void;
  setPendingFile: (file: PendingFile | null) => void;
  clearPendingFile: () => void;

  // Optimistic updates for better UX
  addOptimisticMessage: (message: Message) => void;
  clearOptimisticMessages: () => void;

  // Processing state actions
  setProcessingMessageId: (messageId: string | null) => void;
  clearProcessingMessage: () => void;

  // New chat helper
  startNewChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [processingMessageId, setProcessingMessageId] = useState<string | null>(null);

  // Derived state: is currently processing a message
  const isProcessing = useMemo(() => processingMessageId !== null, [processingMessageId]);

  const clearPendingFile = useCallback(() => {
    setPendingFile(null);
  }, []);

  const addOptimisticMessage = useCallback((message: Message) => {
    setOptimisticMessages((prev) => [...prev, message]);
  }, []);

  const clearOptimisticMessages = useCallback(() => {
    setOptimisticMessages([]);
  }, []);

  const clearProcessingMessage = useCallback(() => {
    setProcessingMessageId(null);
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
    setPendingFile(null);
    setOptimisticMessages([]);
    setProcessingMessageId(null);
  }, []);

  const value: ChatContextType = {
    currentChatId,
    pendingFile,
    optimisticMessages,
    processingMessageId,
    isProcessing,
    setCurrentChatId,
    setPendingFile,
    clearPendingFile,
    addOptimisticMessage,
    clearOptimisticMessages,
    setProcessingMessageId,
    clearProcessingMessage,
    startNewChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
