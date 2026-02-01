"use client";

import { FC, useState, useCallback, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ChatWindow from "./ChatWindow";
import { TChatBubbleButtonProps, TChatMessage } from "./index.types";

const ChatBubbleButton: FC<TChatBubbleButtonProps> = ({
  className,
  initialOpen = false,
  onMessageSend,
  messages: externalMessages = [],
  placeholder = "Type your message...",
  title = "Chat",
  suggestedPrompts,
  onSuggestedPromptClick,
  isTyping = false,
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  // Use external messages directly instead of syncing with state
  const messages = externalMessages;

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(
    async (message: string) => {
      // Just call the parent handler - parent manages the messages state
      if (onMessageSend) {
        await onMessageSend(message);
      }
    },
    [onMessageSend],
  );

  return (
    <>
      <motion.div
        className={cn("fixed bottom-6 right-6 z-50", className)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={handleToggle}
          size="icon"
          className="size-14 rounded-full shadow-lg"
          aria-label="Open chat"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="size-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="size-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <ChatWindow
        isOpen={isOpen}
        onClose={handleClose}
        messages={messages}
        onMessageSend={handleSend}
        placeholder={placeholder}
        title={title}
        suggestedPrompts={suggestedPrompts}
        onSuggestedPromptClick={onSuggestedPromptClick}
        isTyping={isTyping}
      />
    </>
  );
};

export default ChatBubbleButton;
