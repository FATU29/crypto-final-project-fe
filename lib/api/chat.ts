// AI Chatbox API Client for VIP users

import { ChatMessageRequest, ChatResponse } from "@/types/chat";
import { config } from "@/config";

// Use API Gateway URL - all requests should go through the gateway
const API_BASE_URL = config.api.baseUrl;

/**
 * Send a chat message to the AI assistant
 * This endpoint is VIP-only and requires authentication
 * Route goes through API Gateway which validates VIP status
 */
export async function sendChatMessage(
  request: ChatMessageRequest,
  accessToken: string,
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error(
        "This feature is only available for VIP users. Please upgrade your account.",
      );
    }
    const error = await response.json().catch(() => ({
      detail: "Failed to send message",
    }));
    throw new Error(error.detail || "Failed to send message");
  }

  const data = await response.json();

  // Transform timestamp strings to Date objects
  return {
    ...data,
    message: {
      ...data.message,
      timestamp: new Date(data.message.timestamp),
    },
  };
}

/**
 * Clear a conversation history
 * This endpoint is VIP-only and requires authentication
 * Route goes through API Gateway
 */
export async function clearConversation(
  conversationId: string,
  accessToken: string,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/ai/chat/${conversationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok && response.status !== 204) {
    if (response.status === 403) {
      throw new Error("This feature is only available for VIP users.");
    }
    throw new Error("Failed to clear conversation");
  }
}
