import React from 'react';
import { cn } from '../../utils/cn';
import type { ChatMessage } from '../../types';
import { LANGUAGE_LABELS } from '../../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 animate-slide-in-up',
        isUser
          ? 'bg-blue-600 text-white rounded-br-md'
          : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-md'
      )}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">AI</span>
            </div>
            <span className="text-[10px] font-semibold text-blue-400">StadiumAI</span>
          </div>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className={cn('flex items-center gap-2 mt-2', isUser ? 'justify-end' : 'justify-start')}>
          <span className={cn('text-[10px]', isUser ? 'text-blue-200' : 'text-slate-500')}>
            {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded', isUser ? 'bg-blue-500/30 text-blue-200' : 'bg-slate-700 text-slate-400')}>
            {LANGUAGE_LABELS[message.language] || message.language}
          </span>
          {message.confidence !== undefined && !isUser && (
            <span className="text-[10px] text-slate-500">{Math.round(message.confidence * 100)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};