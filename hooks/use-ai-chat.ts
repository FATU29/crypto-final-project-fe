// Hook for AI Chatbox with VIP validation

"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { auth } from "@/lib/auth/utils";
import { sendChatMessage } from "@/lib/api/chat";
import type { ChatMessage } from "@/types/chat";
import {
  saveConversation,
  getLatestConversation,
  clearConversation as clearStoredConversation,
} from "@/lib/storage/chatStorage";
import { parseSuggestions } from "@/lib/utils/parseSuggestions";

export interface UseAIChatOptions {
  /**
   * Whether to automatically load the latest conversation on mount
   * @default true
   */
  autoLoadLatest?: boolean;
}

export interface UseAIChatReturn {
  /** Current conversation messages */
  messages: ChatMessage[];
  /** Whether the user is VIP and can use chat */
  isVipUser: boolean;
  /** Whether a message is being sent */
  isSending: boolean;
  /** Error message if any */
  error: string | null;
  /** Current conversation ID */
  conversationId: string | null;
  /** Send a message to the AI */
  sendMessage: (message: string) => Promise<void>;
  /** Clear the current conversation */
  clearChat: () => void;
  /** Whether the user is authenticated */
  /** Dynamic suggestions extracted from AI response */
  dynamicSuggestions: string[];
  isAuthenticated: boolean;
}

/**
 * Hook for AI Chatbox functionality
 * Handles VIP validation, message sending, and conversation storage
 */
export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { autoLoadLatest = true } = options;
  const { user, isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is VIP
  const isVipUser = user?.accountType === "VIP";

  // Load latest conversation on mount
  useEffect(() => {
    if (!autoLoadLatest || !isVipUser) return;

    const latest = getLatestConversation();
    if (latest) {
      setConversationId(latest.conversation_id);
      setMessages(latest.messages);
    }
  }, [autoLoadLatest, isVipUser]);

  // Send a message to the AI
  const sendMessage = useCallback(
    async (message: string) => {
      if (!isAuthenticated) {
        setError("Please log in to use the chat feature.");
        return;
      }

      if (!isVipUser) {
        setError(
          "This feature is only available for VIP users. Please upgrade your account.",
        );
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const accessToken = auth.getToken();
        if (!accessToken) {
          throw new Error("Unable to get access token. Please log in again.");
        }

        // Add user message to UI immediately
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Send to backend
        const response = await sendChatMessage(
          {
            message,
            conversation_id: conversationId || undefined,
          },
          accessToken,
        );

        // Update conversation ID if new
        if (!conversationId) {
          setConversationId(response.conversation_id);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: response.message.id,
          role: response.message.role,
          content: response.message.content,
          timestamp: response.message.timestamp,
        };

        // Parse suggestions from AI response
        const { mainContent, suggestions } = parseSuggestions(
          response.message.content,
        );

        // Update assistant message with clean content (without [SUGGESTIONS])
        if (suggestions.length > 0) {
          assistantMessage.content = mainContent;
          setDynamicSuggestions(suggestions);
        } else {
          setDynamicSuggestions([]);
        }

        setMessages((prev) => {
          const updated = [...prev, assistantMessage];
          // Save to localStorage
          saveConversation(response.conversation_id, updated);
          return updated;
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Error sending chat message:", err);

        // Remove the user message we optimistically added
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsSending(false);
      }
    },
    [isAuthenticated, isVipUser, conversationId],
  );

  // Clear the current conversation
  const clearChat = useCallback(() => {
    setMessages([]);
    if (conversationId) {
      clearStoredConversation(conversationId);
    }
    setConversationId(null);
    setDynamicSuggestions([]);
    setError(null);
  }, [conversationId]);

  return {
    messages,
    isVipUser,
    isSending,
    error,
    conversationId,
    sendMessage,
    clearChat,
    isAuthenticated,
    dynamicSuggestions,
  };
}
