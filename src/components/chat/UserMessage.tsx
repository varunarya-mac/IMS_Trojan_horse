/**
 * UserMessage Component
 * Displays a user message bubble
 */

import { IoDocumentTextOutline } from 'react-icons/io5';
import type { Message } from '../../types/chat';

interface UserMessageProps {
  message: Message;
}

const UserMessage = ({ message }: UserMessageProps) => {
  // Check if message has attached file info (stored in content or separate field)
  const hasFile = message.content.includes('[CSV:');

  return (
    <div className="flex items-start gap-3 p-4 justify-end">
      {/* Message content */}
      <div className="max-w-[70%]">
        <div className="bg-[#1D2441] rounded-[20px] px-4 py-3">
          <p className="text-white text-sm font-open-sans whitespace-pre-wrap">
            {message.content}
          </p>
        </div>

        {/* File attachment indicator */}
        {hasFile && (
          <div className="flex items-center gap-2 mt-2 justify-end">
            <IoDocumentTextOutline className="w-4 h-4 text-[#248CD0]" />
            <span className="text-xs text-[#A9A9A9] font-open-sans">
              CSV file attached
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex justify-end mt-1">
          <span className="text-xs text-[#A9A9A9] font-open-sans">
            {new Date(message.$createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* User Avatar */}
      <div className="w-8 h-8 rounded-full bg-[#248CD0] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-sm font-semibold">U</span>
      </div>
    </div>
  );
};

export default UserMessage;
