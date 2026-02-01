"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useAIChat } from "@/hooks/use-ai-chat";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Crown } from "lucide-react";

import { ChatBubbleButton } from "./index";
import type { TChatMessage } from "./index.types";

// Suggested prompts for users to get started
const SUGGESTED_PROMPTS = [
  "📊 Query database: Is Bitcoin trending up or down based on recent news?",
  "🔍 Search articles about Ethereum in database and predict 24h price",
  "📈 Analyze database articles: Does Solana (SOL) have investment potential?",
  "💹 Compare news data from DB for BNB vs Cardano (ADA)",
  "⚡ Get latest news from database and analyze BTC price impact",
  "🎯 Find patterns in database articles and predict DOGE trend",
  "💾 Query database: Top 5 most positive crypto news today",
  "📉 Analyze sentiment from database for crypto market this week",
];

/**
 * Wrapper component for AI-powered ChatBubble with VIP restriction
 * Integrates with OpenAI API and handles authentication & VIP validation
 */
const ChatBubbleButtonWrapper = () => {
  const {
    messages: chatMessages,
    isVipUser,
    isSending,
    error,
    sendMessage,
    isAuthenticated,
    dynamicSuggestions, // Get dynamic suggestions from AI response
  } = useAIChat({ autoLoadLatest: true });

  // Convert chat messages to bubble format
  const messages: TChatMessage[] = useMemo(
    () =>
      chatMessages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === "user" ? "user" : "assistant",
        timestamp: msg.timestamp,
      })),
    [chatMessages],
  );

  // Handle message sending
  const handleMessageSend = useCallback(
    async (message: string) => {
      await sendMessage(message);
    },
    [sendMessage],
  );

  // Handle suggested prompt click
  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      // Remove emoji from the prompt before sending
      const cleanPrompt = prompt.replace(/^[^\s]+\s/, "");
      handleMessageSend(cleanPrompt);
    },
    [handleMessageSend],
  );

  // Show different title based on user status
  const title = useMemo(() => {
    if (!isAuthenticated) return "Market Analyst AI (Login Required)";
    if (!isVipUser) return "Market Analyst AI (VIP Only)";
    return "Market Analyst AI";
  }, [isAuthenticated, isVipUser]);

  // Add VIP badge or login message to messages if user is not VIP
  const messagesWithNotice = useMemo(() => {
    if (isAuthenticated && isVipUser) {
      // VIP user - show normal messages or welcome message with suggestions
      if (messages.length === 0) {
        const welcomeMessage: TChatMessage = {
          id: "welcome",
          content:
            "👋 Welcome! I'm your **Predictive Market Analyst AI**.\n\n" +
            "I analyze cryptocurrency markets and provide data-driven insights on:\n" +
            "• Market trends and predictions\n" +
            "• Technical and sentiment analysis\n" +
            "• Trading strategies and patterns\n" +
            "• Specific crypto assets (BTC, ETH, etc.)\n\n" +
            "💡 **Try these questions:**\n\n" +
            SUGGESTED_PROMPTS.map((prompt, i) => `${i + 1}. ${prompt}`).join(
              "\n",
            ),
          sender: "assistant" as const,
          timestamp: new Date(),
        };
        return [welcomeMessage];
      }
      return messages;
    }

    // Non-VIP or not authenticated - show notice
    const noticeMessage: TChatMessage = {
      id: "vip-notice",
      content: !isAuthenticated
        ? "🔐 Please log in to chat with the AI Market Analyst."
        : "👑 This Predictive Market Analyst AI is a VIP-only feature. Upgrade your account to unlock professional market analysis, predictions with confidence scores, and data-driven insights!",
      sender: "assistant" as const,
      timestamp: new Date(),
    };

    return [noticeMessage, ...messages];
  }, [isAuthenticated, isVipUser, messages]);

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error("AI Chat Error:", error);
    }
  }, [error]);

  // Debug: Log suggestions
  useEffect(() => {
    console.log("ChatBubbleButtonWrapper - isAuthenticated:", isAuthenticated);
    console.log("ChatBubbleButtonWrapper - isVipUser:", isVipUser);
    console.log(
      "ChatBubbleButtonWrapper - dynamicSuggestions:",
      dynamicSuggestions,
    );
    console.log(
      "ChatBubbleButtonWrapper - SUGGESTED_PROMPTS:",
      SUGGESTED_PROMPTS,
    );
    const finalSuggestions =
      isAuthenticated && isVipUser
        ? dynamicSuggestions.length > 0
          ? dynamicSuggestions
          : SUGGESTED_PROMPTS
        : undefined;
    console.log(
      "ChatBubbleButtonWrapper - finalSuggestions to pass:",
      finalSuggestions,
    );
  }, [isAuthenticated, isVipUser, dynamicSuggestions]);

  return (
    <>
      <ChatBubbleButton
        onMessageSend={handleMessageSend}
        messages={messagesWithNotice}
        title={
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {isAuthenticated && isVipUser && (
              <Badge variant="default" className="gap-1">
                <Crown className="size-3" />
                VIP
              </Badge>
            )}
          </div>
        }
        placeholder={
          isAuthenticated && isVipUser
            ? isSending
              ? "Analyzing..."
              : "Ask about market trends, predictions..."
            : "Login as VIP for market analysis..."
        }
        suggestedPrompts={
          isAuthenticated && isVipUser && dynamicSuggestions.length > 0
            ? dynamicSuggestions // Only show button suggestions if AI provides dynamic ones
            : undefined
        }
        onSuggestedPromptClick={handleSuggestedPrompt}
        isTyping={isSending}
      />

      {/* Error alert - could be positioned near the chat bubble */}
      {error && (
        <div className="fixed bottom-24 right-6 z-40 w-80">
          <Alert variant="destructive">
            <Info className="size-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
};

export default ChatBubbleButtonWrapper;
