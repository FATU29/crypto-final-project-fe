// AI Chatbox types for VIP users

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatMessageRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatResponse {
  conversation_id: string;
  message: ChatMessage;
  total_messages: number;
}

export interface ConversationSession {
  conversation_id: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}
