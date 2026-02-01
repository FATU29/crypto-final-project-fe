# Chat Components

A modular chatbox bubble button component built with shadcn/ui, Tailwind CSS, and Framer Motion.

## Components

### `ChatBubbleButton`
The main floating button component that opens/closes the chat window.

### `ChatWindow`
The chat interface dialog that displays messages and handles input.

### `ChatMessage`
Individual message bubble component for displaying chat messages.

### `ChatInput`
Input component for typing and sending messages.

## Usage

### Basic Example

```tsx
import { ChatBubbleButton } from '@/components/chat';

export default function Page() {
  const handleMessageSend = async (message: string) => {
    // Handle message sending logic
    console.log('Message sent:', message);
  };

  return (
    <ChatBubbleButton
      onMessageSend={handleMessageSend}
      title="Support Chat"
      placeholder="Type your message..."
    />
  );
}
```

### With Message State Management

```tsx
'use client';

import { useState, useCallback } from 'react';
import { ChatBubbleButton, TChatMessage } from '@/components/chat';

export default function Page() {
  const [messages, setMessages] = useState<TChatMessage[]>([]);

  const handleMessageSend = useCallback(async (message: string) => {
    // Add user message
    const userMessage: TChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Add assistant response
    const assistantMessage: TChatMessage = {
      id: `assistant-${Date.now()}`,
      content: `You said: "${message}"`,
      sender: 'assistant',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  return (
    <ChatBubbleButton
      messages={messages}
      onMessageSend={handleMessageSend}
      title="AI Assistant"
      placeholder="Ask me anything..."
    />
  );
}
```

## Props

### `ChatBubbleButton`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `initialOpen` | `boolean` | `false` | Whether the chat window is initially open |
| `onMessageSend` | `(message: string) => void \| Promise<void>` | - | Callback when a message is sent |
| `messages` | `TChatMessage[]` | `[]` | Array of chat messages |
| `placeholder` | `string` | `'Type your message...'` | Placeholder text for input |
| `title` | `string` | `'Chat'` | Title of the chat window |

**Note:** The chat bubble button is always positioned at the bottom-right of the screen.

### `TChatMessage`

```typescript
type TChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};
```

## Features

- ✨ Smooth animations with Framer Motion
- 🎨 Beautiful UI with shadcn/ui components
- 📱 Responsive design
- ♿ Accessible (ARIA labels, keyboard navigation)
- 🔄 Auto-scroll to latest message
- ⌨️ Enter to send, Shift+Enter for new line
- 🎯 TypeScript support with full type safety

## Styling

The components use Tailwind CSS and follow your project's design system. You can customize the appearance by:

1. Passing `className` props to individual components
2. Modifying the component files directly
3. Using Tailwind's theme configuration

## Dependencies

- `@radix-ui/react-dialog` - Dialog component
- `@radix-ui/react-scroll-area` - Scrollable area
- `lucide-react` - Icons
- `motion` (Framer Motion) - Animations
- `dayjs` - Date formatting
- `tailwindcss` - Styling
