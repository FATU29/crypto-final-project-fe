"use client";

import { FC } from "react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: FC<TypingIndicatorProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 w-fit",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        <div className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
        <div className="size-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
        <div className="size-2 rounded-full bg-muted-foreground/60 animate-bounce" />
      </div>
      <span className="text-xs text-muted-foreground">AI is analyzing...</span>
    </div>
  );
};

export default TypingIndicator;
