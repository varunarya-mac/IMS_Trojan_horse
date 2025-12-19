/**
 * Chat Components
 * Barrel export for all chat-related components
 *
 * Components are organized into categories:
 * - core/      - Main container components
 * - messages/  - Message display components
 * - input/     - Input and file handling
 * - display/   - Data visualization components
 * - feedback/  - Status and feedback indicators
 */

// Core components
export { default as ChatContainer } from './ChatContainer';

// Message components
export { default as MessageList } from './MessageList';
export { default as MessageItem } from './MessageItem';
export { default as UserMessage } from './UserMessage';
export { default as AssistantMessage } from './AssistantMessage';

// Input components
export { default as ChatInput } from './ChatInput';
export { default as FileUploadButton } from './FileUploadButton';
export { default as UploadProgress } from './UploadProgress';

// Display components
export { default as RecommendationCard } from './RecommendationCard';
export { default as RecommendationList } from './RecommendationList';
export { default as DatapointsTable } from './DatapointsTable';
export { default as GraphDisplay } from './GraphDisplay';

// Feedback components
export { default as LoadingIndicator } from './LoadingIndicator';
export { default as ErrorMessage } from './ErrorMessage';
export { default as EmptyState } from './EmptyState';

// Re-export from subfolders for alternative import paths
export * from './core';
export * from './messages';
export * from './input';
export * from './display';
export * from './feedback';
