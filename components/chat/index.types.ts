export type TChatMessage = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

export type TChatBubbleButtonProps = {
  className?: string;
  initialOpen?: boolean;
  onMessageSend?: (message: string) => void | Promise<void>;
  messages?: TChatMessage[];
  placeholder?: string;
  title?: React.ReactNode;
  suggestedPrompts?: string[];
  onSuggestedPromptClick?: (prompt: string) => void;
  isTyping?: boolean;
};

export type TChatMessageProps = {
  message: TChatMessage;
  className?: string;
};

export type TChatInputProps = {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
};

export type TChatWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: TChatMessage[];
  onMessageSend: (message: string) => void | Promise<void>;
  placeholder?: string;
  title?: React.ReactNode;
  className?: string;
  suggestedPrompts?: string[];
  onSuggestedPromptClick?: (prompt: string) => void;
  isTyping?: boolean;
};
