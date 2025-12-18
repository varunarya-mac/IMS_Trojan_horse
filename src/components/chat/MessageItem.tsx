/**
 * MessageItem Component
 * Routes to the appropriate message component based on role
 */

import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';
import type { Message, Recommendation } from '../../types/chat';

interface MessageItemProps {
  message: Message;
  onRecommendationAction?: (recommendation: Recommendation) => void;
}

const MessageItem = ({ message, onRecommendationAction }: MessageItemProps) => {
  if (message.role === 'user') {
    return <UserMessage message={message} />;
  }

  return (
    <AssistantMessage
      message={message}
      onRecommendationAction={onRecommendationAction}
    />
  );
};

export default MessageItem;
