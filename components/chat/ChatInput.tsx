"use client";

import { FC, FormEvent, useState, KeyboardEvent, useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { TChatInputProps } from "./index.types";

const ChatInput: FC<TChatInputProps> = ({
  onSend,
  placeholder = "Type your message...",
  disabled = false,
  className,
  value: externalValue,
  onValueChange,
}) => {
  // Use external value if provided, otherwise use internal state
  const [internalMessage, setInternalMessage] = useState("");
  const message = externalValue !== undefined ? externalValue : internalMessage;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      if (externalValue !== undefined && onValueChange) {
        onValueChange("");
      } else {
        setInternalMessage("");
      }
    }
  };

  const handleChange = (value: string) => {
    if (externalValue !== undefined && onValueChange) {
      onValueChange(value);
    } else {
      setInternalMessage(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <Textarea
        value={message}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[60px] max-h-[120px] resize-none"
        rows={1}
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        size="icon"
        className="shrink-0"
      >
        <Send className="size-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
};

export default ChatInput;
