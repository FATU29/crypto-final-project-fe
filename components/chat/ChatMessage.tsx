'use client';

import { FC } from 'react';
import dayjs from 'dayjs';

import { cn } from '@/lib/utils';

import { TChatMessageProps } from './index.types';

const ChatMessage: FC<TChatMessageProps> = ({ message, className }) => {
  const isUser = message.sender === 'user';

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-1 rounded-lg px-4 py-2 shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <span
          className={cn(
            'text-xs opacity-70',
            isUser ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        >
          {dayjs(message.timestamp).format('HH:mm')}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
