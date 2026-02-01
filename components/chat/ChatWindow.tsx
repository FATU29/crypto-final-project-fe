"use client";

import { FC, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { TChatWindowProps } from "./index.types";

const ChatWindow: FC<TChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  onMessageSend,
  placeholder = "Type your message...",
  title = "Chat",
  className,
  suggestedPrompts,
  isTyping = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (isOpen && (messages.length > 0 || isTyping)) {
      // Use setTimeout to ensure DOM is updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages, isTyping]); // Add isTyping to dependencies

  const handleSend = async (message: string) => {
    await onMessageSend(message);
    setInputValue("");
    setTimeout(scrollToBottom, 150);
  };

  const handleSuggestionClick = (prompt: string) => {
    // Insert suggestion into input instead of sending immediately
    const cleanPrompt = prompt.replace(/^[^\s]+\s/, ""); // Remove emoji prefix
    setInputValue(cleanPrompt);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn("flex h-[600px] max-w-md flex-col p-0", className)}
        showCloseButton={false}
      >
        <DialogHeader className="border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8"
            >
              <X className="size-4" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="flex flex-col gap-4 px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-[400px] items-center justify-center text-center text-muted-foreground">
                  <p className="text-sm">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}

              {/* Typing Indicator - show when AI is responding */}
              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Prompts - Always show when available */}
          {suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="border-t bg-muted/30 px-4 py-3 max-h-[180px] overflow-y-auto shrink-0">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                💡 Suggested questions (click to insert):
              </p>
              <div className="flex flex-col gap-2">
                {suggestedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="h-auto whitespace-normal text-left text-xs justify-start px-3 py-2"
                    onClick={() => handleSuggestionClick(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t px-4 py-3 flex-shrink-0">
          <ChatInput
            onSend={handleSend}
            placeholder={placeholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatWindow;
