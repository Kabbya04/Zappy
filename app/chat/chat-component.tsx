// app/chat/page.tsx

"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/chat-message';
import { LucideIcon, Zap, ChevronLeft, ChevronRight, RefreshCw, Sun, Moon, Gamepad2, Bot, Film, Tv2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ChatInput } from './chat-input';

interface Recommendation { 
  title: string; 
  category: string; 
  explanation: string; 
  imageUrl?: string; 
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPageProps {
  chatHistory: Message[];
  userInput: string;
  setUserInput: (value: string) => void;
  isLoading: boolean;
  handleSendMessage: (messageOverride?: string) => void;
  selectedCategory: string | null;
  recommendations: Recommendation[];
  openModal: (recommendation: Recommendation) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  handleStartOver: () => void;
  handleGoToLanding: () => void;
}

export default function ChatPage({
  chatHistory,
  userInput,
  setUserInput,
  isLoading,
  handleSendMessage,
  selectedCategory,
  recommendations,
  openModal,
  isSidebarOpen,
  setIsSidebarOpen,
  handleStartOver,
  handleGoToLanding
}: ChatPageProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const hasConversationStarted = chatHistory.length > 0;

  const handlePredefinedPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const Sidebar = () => {
    const ICONS: Record<string, LucideIcon> = { 
      Game: Gamepad2, 
      Anime: Bot, 
      Movie: Film, 
      'TV Series': Tv2 
    };
    const Icon = selectedCategory ? ICONS[selectedCategory] : Bot;
    
    return (
      <div className={`transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col flex-shrink-0 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 md:w-20 p-0 md:p-2 items-center'}`}>
        <div className={`flex items-center mb-4 pb-4 border-b border-border ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {/* MODIFICATION: This button is now completely hidden when the sidebar is closed */}
          <button onClick={handleGoToLanding} className={`flex items-center gap-2 ${isSidebarOpen ? 'flex' : 'hidden'}`}>
            <Zap className="text-secondary" />
            <span className="text-xl font-bold">Zappy</span>
          </button>
          
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-muted-foreground/60 hover:bg-background">
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className={`text-sm font-semibold text-muted-foreground mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>Recommendations</div>
          <ul className="flex flex-col gap-2">
            {recommendations.map((rec, index) => (
              <li key={index}>
                <button 
                  onClick={() => openModal(rec)} 
                  className={`w-full text-left p-3 rounded-lg text-card-foreground/80 hover:bg-background transition-colors flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}
                >
                  <Icon className="text-primary flex-shrink-0" size={20} />
                  <span className={`truncate ${isSidebarOpen ? 'inline' : 'hidden'}`}>{rec.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={`mt-auto pt-4 border-t border-border flex flex-col gap-2 ${isSidebarOpen ? '' : 'w-full px-2'}`}>
          <button 
            onClick={handleStartOver} 
            className={`w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
          >
            <RefreshCw size={18} className="flex-shrink-0" />
            <span className={`font-medium ${isSidebarOpen ? 'inline' : 'hidden'}`}>Start Over</span>
          </button>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className={`w-full bg-muted text-muted-foreground font-semibold py-2 rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2 ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
          >
            {isMounted && (theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />)}
            <span className={`font-medium ${isSidebarOpen ? 'inline' : 'hidden'}`}>
              {isMounted && (theme === 'dark' ? 'Light' : 'Dark')}
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <div className={`flex flex-col flex-grow h-full bg-transparent ${!hasConversationStarted ? 'items-center justify-center' : ''}`}>
        {hasConversationStarted ? (
          <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-grow pt-6 space-y-6 overflow-y-auto px-4">
              {chatHistory.map((msg, index) => <ChatMessage key={index} {...msg} />)}
              {isLoading && chatHistory.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-primary-foreground text-lg flex-shrink-0">Z</div>
                  <div className="p-4 rounded-2xl bg-card">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-muted rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-muted rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-muted rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full pt-4 pb-6 bg-transparent sticky bottom-0 border-t border-border">
              <ChatInput 
                userInput={userInput} 
                setUserInput={setUserInput} 
                isLoading={isLoading} 
                handleSendMessage={() => handleSendMessage()} 
                hasConversationStarted={hasConversationStarted} 
                handlePredefinedPromptClick={handlePredefinedPromptClick} 
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 text-center w-full max-w-2xl mx-auto p-4">
            <div className="flex flex-col items-center gap-4">
              <Zap className="w-12 h-12 text-secondary" />
              <h1 className="text-4xl md:text-5xl font-serif">
                {selectedCategory ? `Ready to discuss ${selectedCategory}s?` : "Let's find something great!"}
              </h1>
            </div>
            <ChatInput 
              userInput={userInput} 
              setUserInput={setUserInput} 
              isLoading={isLoading} 
              handleSendMessage={() => handleSendMessage()} 
              hasConversationStarted={hasConversationStarted} 
              handlePredefinedPromptClick={handlePredefinedPromptClick} 
            />
          </div>
        )}
      </div>
    </div>
  );
}