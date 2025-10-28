"use client";


import { Send } from 'lucide-react';

const predefinedPrompts = [
  "Tell me more about the first recommendation.",
  "Why did you choose these for me?",
  "Give me one more recommendation.",
  "Which one is the most critically acclaimed?",
];

interface ChatInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  hasConversationStarted: boolean;
  handlePredefinedPromptClick: (prompt: string) => void;
}

export const ChatInput = ({ 
  userInput, 
  setUserInput, 
  isLoading, 
  handleSendMessage, 
  hasConversationStarted,
  handlePredefinedPromptClick
}: ChatInputProps) => {
  return (
    <div className="w-full">
      {!hasConversationStarted && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {predefinedPrompts.map((prompt) => (
            <button 
              key={prompt} 
              onClick={() => handlePredefinedPromptClick(prompt)} 
              className="p-3 text-sm bg-card/50 border border-border rounded-lg text-left text-foreground/70 hover:bg-card/70 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center bg-card rounded-2xl p-2.5 shadow-lg border border-border">
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} 
          placeholder="Ask Zappy about your recommendations..." 
          className="w-full bg-transparent text-foreground focus:outline-none px-3" 
          disabled={isLoading} 
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading} 
          className="p-2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};