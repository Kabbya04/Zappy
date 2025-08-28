"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground text-lg flex-shrink-0">
          Z
        </div>
      )}
      <div
        className={`max-w-md rounded-2xl p-4 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none shadow-sm'
        }`}
      >
        <div className="prose prose-sm prose-p:text-card-foreground/80 prose-strong:text-card-foreground max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};