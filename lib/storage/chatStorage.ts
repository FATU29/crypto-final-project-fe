// Chat conversation storage using localStorage

import { ConversationSession, ChatMessage } from "@/types/chat";

const STORAGE_KEY = "ai_chat_conversations";
const MAX_STORED_CONVERSATIONS = 5;
const MAX_MESSAGES_PER_CONVERSATION = 50;

/**
 * Get all stored conversation sessions
 */
export function getStoredConversations(): ConversationSession[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const conversations = JSON.parse(stored);

    // Parse date strings back to Date objects
    return conversations.map((conv: ConversationSession) => ({
      ...conv,
      created_at: new Date(conv.created_at),
      updated_at: new Date(conv.updated_at),
      messages: conv.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error("Error reading conversations from storage:", error);
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(
  conversationId: string,
): ConversationSession | null {
  const conversations = getStoredConversations();
  return (
    conversations.find((c) => c.conversation_id === conversationId) || null
  );
}

/**
 * Save or update a conversation
 */
export function saveConversation(
  conversationId: string,
  messages: ChatMessage[],
): void {
  if (typeof window === "undefined") return;

  try {
    let conversations = getStoredConversations();

    // Find existing conversation
    const existingIndex = conversations.findIndex(
      (c) => c.conversation_id === conversationId,
    );

    // Limit messages per conversation
    const limitedMessages = messages.slice(-MAX_MESSAGES_PER_CONVERSATION);

    const now = new Date();

    if (existingIndex >= 0) {
      // Update existing conversation
      conversations[existingIndex] = {
        conversation_id: conversationId,
        messages: limitedMessages,
        created_at: conversations[existingIndex].created_at,
        updated_at: now,
      };
    } else {
      // Create new conversation
      const newConversation: ConversationSession = {
        conversation_id: conversationId,
        messages: limitedMessages,
        created_at: now,
        updated_at: now,
      };

      conversations.push(newConversation);

      // Limit total number of stored conversations
      // Keep only the most recent ones
      if (conversations.length > MAX_STORED_CONVERSATIONS) {
        conversations = conversations
          .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
          .slice(0, MAX_STORED_CONVERSATIONS);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

/**
 * Clear a specific conversation
 */
export function clearConversation(conversationId: string): void {
  if (typeof window === "undefined") return;

  try {
    const conversations = getStoredConversations();
    const filtered = conversations.filter(
      (c) => c.conversation_id !== conversationId,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error clearing conversation:", error);
  }
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing all conversations:", error);
  }
}

/**
 * Get the most recent conversation
 */
export function getLatestConversation(): ConversationSession | null {
  const conversations = getStoredConversations();
  if (conversations.length === 0) return null;

  return conversations.reduce((latest, current) =>
    current.updated_at > latest.updated_at ? current : latest,
  );
}
