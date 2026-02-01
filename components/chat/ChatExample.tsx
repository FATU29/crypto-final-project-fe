'use client';

import { useState, useCallback } from 'react';

import { ChatBubbleButton, TChatMessage } from './index';

/**
 * Example usage of ChatBubbleButton component
 * This demonstrates how to integrate the chat bubble button into your application
 */
const ChatExample = () => {
  const [messages, setMessages] = useState<TChatMessage[]>([]);

  const handleMessageSend = useCallback(async (message: string) => {
    // Simulate API call or processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Add assistant response (you can replace this with actual API call)
    const assistantMessage: TChatMessage = {
      id: `assistant-${Date.now()}`,
      content: `You said: "${message}". This is a demo response!`,
      sender: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  return (
    <ChatBubbleButton
      messages={messages}
      onMessageSend={handleMessageSend}
      title="Support Chat"
      placeholder="Ask me anything..."
    />
  );
};

export default ChatExample;
