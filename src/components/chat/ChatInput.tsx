/**
 * ChatInput Component
 * Main input bar with text input, file upload, and send button
 */

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from 'react';
import { IoSendOutline, IoMenuOutline } from 'react-icons/io5';
import FileUploadButton from './FileUploadButton';
import UploadProgress from './UploadProgress';
import type { PendingFile } from '../../types/chat';

interface ChatInputProps {
  onSend: (message: string, file?: PendingFile) => void;
  pendingFile: PendingFile | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({
  onSend,
  pendingFile,
  onFileSelect,
  onFileRemove,
  disabled = false,
  placeholder = 'Ask anything related to refrigerator devices',
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !pendingFile) return;
    if (disabled) return;
    if (pendingFile && pendingFile.status === 'uploading') return;

    onSend(message.trim(), pendingFile || undefined);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const canSend =
    (message.trim() || pendingFile) &&
    !disabled &&
    (!pendingFile || pendingFile.status !== 'uploading');

  return (
    <div className="w-full max-w-[800px] mx-auto">
      {/* Input Box */}
      <div className="bg-white border border-[#EBEBEB] rounded-[30px] shadow-[8px_17px_28px_6px_rgba(0,0,0,0.15)] p-4">
        <form onSubmit={handleSubmit}>
          {/* Pending file preview */}
          {pendingFile && (
            <UploadProgress
              fileName={pendingFile.fileName}
              fileSize={pendingFile.fileSize}
              progress={pendingFile.uploadProgress}
              status={pendingFile.status}
              onRemove={onFileRemove}
            />
          )}

          {/* Input Field */}
          <textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            className="w-full text-[17px] font-semibold text-[#000000] placeholder-[#A9A9A9] font-open-sans bg-transparent outline-none resize-none mb-4"
            style={{ minHeight: '24px', maxHeight: '150px' }}
          />

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* File Upload Button */}
              <FileUploadButton
                onFileSelect={onFileSelect}
                disabled={disabled || !!pendingFile}
              />

              {/* Settings Button */}
              <button
                type="button"
                className="w-[33px] h-[33px] flex items-center justify-center border border-[#EBEBEB] rounded-full hover:bg-[#F5F7FB] transition-colors"
              >
                <IoMenuOutline className="w-4 h-4 text-[#D8D8D8]" />
              </button>
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!canSend}
              className={`w-[33px] h-[33px] flex items-center justify-center border rounded-full transition-colors ${
                canSend
                  ? 'border-[#248CD0] bg-[#248CD0] hover:bg-[#1a7ab8]'
                  : 'border-[#EBEBEB] hover:bg-[#F5F7FB]'
              }`}
            >
              <IoSendOutline
                className={`w-4 h-4 ${canSend ? 'text-white' : 'text-[#D8D8D8]'}`}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
