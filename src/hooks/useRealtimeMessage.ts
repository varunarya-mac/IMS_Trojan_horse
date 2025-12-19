/**
 * Realtime Message Subscription Hook
 * Subscribes to Appwrite Realtime for message updates
 */

import { useEffect, useRef, useCallback } from 'react';
import { appwriteClient } from '@api/services/chatApi';
import { APPWRITE_CONFIG } from '@config/appwrite';
import { isProcessingMessage } from '@types/chat';
import type { RealtimeMessagePayload, Message } from '@types/chat';

// Subscription timeout (60 seconds)
const SUBSCRIPTION_TIMEOUT = 200 * 1000;

interface UseRealtimeMessageOptions {
  messageId: string;
  onUpdate: (message: RealtimeMessagePayload) => void;
  onError?: (error: Error) => void;
  onTimeout?: () => void;
  enabled?: boolean;
}

interface UseRealtimeMessageReturn {
  unsubscribe: () => void;
  isSubscribed: boolean;
}

/**
 * Hook to subscribe to a single message's realtime updates
 * Auto-unsubscribes when message content is no longer a processing placeholder
 */
export function useRealtimeMessage({
  messageId,
  onUpdate,
  onError,
  onTimeout,
  enabled = true,
}: UseRealtimeMessageOptions): UseRealtimeMessageReturn {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubscribedRef = useRef(false);

  const cleanup = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isSubscribedRef.current = false;
  }, []);

  const unsubscribe = useCallback(() => {
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (!enabled || !messageId) {
      return;
    }

    console.log('---------documents.message id------------', messageId);
    // Build the channel string for this specific message document
    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.messages}.documents.${messageId}`;
    console.log('---------channel-----------', channel );

    try {
      // Subscribe to the message document
      const unsubscribeFn = appwriteClient.subscribe<RealtimeMessagePayload>(
        channel,
        (response) => {
          const payload = response.payload;

          // Check if the message is still processing
          if (!isProcessingMessage(payload.content)) {
            // Message has been updated with real content
            onUpdate(payload);
            // Auto-unsubscribe since we got the real content
            cleanup();
          }
        }
      );

      unsubscribeRef.current = unsubscribeFn;
      isSubscribedRef.current = true;

      // Set up timeout
      timeoutRef.current = setTimeout(() => {
        console.warn(`Realtime subscription timeout for message: ${messageId}`);
        cleanup();
        onTimeout?.();
      }, SUBSCRIPTION_TIMEOUT);

    } catch (error) {
      console.error('Failed to subscribe to realtime:', error);
      onError?.(error instanceof Error ? error : new Error('Subscription failed'));
    }

    // Cleanup on unmount or when dependencies change
    return cleanup;
  }, [messageId, enabled, onUpdate, onError, onTimeout, cleanup]);

  return {
    unsubscribe,
    isSubscribed: isSubscribedRef.current,
  };
}

/**
 * Manager for multiple message subscriptions
 * Useful when handling multiple pending messages
 */
export function useRealtimeMessageManager() {
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const subscribe = useCallback((
    messageId: string,
    onUpdate: (message: RealtimeMessagePayload) => void,
    onError?: (error: Error) => void,
    onTimeout?: () => void
  ) => {
    // Don't double-subscribe
    if (subscriptionsRef.current.has(messageId)) {
      return;
    }
    console.log('---------documents.message id--22----------', {messageId} );

    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.messages}.documents.${messageId}`;
    console.log('---------channel 22-----------', {channel} );

    try {
      const unsubscribeFn = appwriteClient.subscribe<RealtimeMessagePayload>(
        channel,
        (response) => {
          const payload = response.payload;

          if (!isProcessingMessage(payload.content)) {
            onUpdate(payload);
            // Cleanup this specific subscription
            unsubscribeOne(messageId);
          }
        }
      );

      subscriptionsRef.current.set(messageId, unsubscribeFn);

      // Set timeout for this subscription
      const timeout = setTimeout(() => {
        console.warn(`Realtime subscription timeout for message: ${messageId}`);
        unsubscribeOne(messageId);
        onTimeout?.();
      }, SUBSCRIPTION_TIMEOUT);

      timeoutsRef.current.set(messageId, timeout);

    } catch (error) {
      console.error('Failed to subscribe to realtime:', error);
      onError?.(error instanceof Error ? error : new Error('Subscription failed'));
    }
  }, []);

  const unsubscribeOne = useCallback((messageId: string) => {
    const unsubscribe = subscriptionsRef.current.get(messageId);
    if (unsubscribe) {
      unsubscribe();
      subscriptionsRef.current.delete(messageId);
    }

    const timeout = timeoutsRef.current.get(messageId);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(messageId);
    }
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
    subscriptionsRef.current.clear();

    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  return {
    subscribe,
    unsubscribeOne,
    unsubscribeAll,
    getActiveSubscriptions: () => Array.from(subscriptionsRef.current.keys()),
  };
}

/**
 * Helper to check if a message needs realtime subscription
 */
export function needsRealtimeSubscription(message: Message): boolean {
  return message.role === 'assistant' && isProcessingMessage(message.content);
}
