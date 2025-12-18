/**
 * MessageList Component
 * Scrollable message area with auto-scroll to bottom
 */

import { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import LoadingIndicator from './LoadingIndicator';
import type { Message, Recommendation } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onRecommendationAction?: (recommendation: Recommendation) => void;
}

const MessageList = ({
  messages,
  isLoading = false,
  onRecommendationAction,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6"
    >
      <div className="max-w-[900px] mx-auto">
        {messages.map((message) => (
          <MessageItem
            key={message.$id}
            message={message}
            onRecommendationAction={onRecommendationAction}
          />
        ))}

        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default MessageList;
