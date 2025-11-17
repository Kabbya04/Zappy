"use client";

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/components/chat-message';
import { LucideIcon, Zap, ChevronLeft, ChevronRight, RefreshCw, Sun, Moon, Gamepad2, Bot, Film, Tv2, User, History } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ChatInput } from '@/app/chat/chat-input';
import { createClient } from '@/lib/supabase/client';

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

interface ChatComponentProps {
  sessionId: string;
  category: string;
  messages: { role: string; content: string }[];
  queryLimitReached: boolean;
  userId: string;
  recommendations?: Recommendation[];
}

export default function ChatComponent({ sessionId, category, messages, queryLimitReached, userId, recommendations: initialRecommendations }: ChatComponentProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; category: string; created_at: string }[]>([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize chat history with existing messages
  useEffect(() => {
    console.log('Messages received from props:', messages);
    console.log('Number of messages:', messages?.length);
    
    if (messages && messages.length > 0) {
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      console.log('Formatted messages:', formattedMessages);
      setChatHistory(formattedMessages);
    } else {
      console.log('No messages found for this session');
      setChatHistory([]);
    }
  }, [messages]);

  // Fetch user's sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, category, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching sessions:', error);
          return;
        }

        setSessions(data || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    fetchSessions();
  }, [userId, supabase]);

  // Initialize recommendations from props or fetch based on category
  useEffect(() => {
    if (initialRecommendations && initialRecommendations.length > 0) {
      console.log('Using initial recommendations from session:', initialRecommendations);
      setRecommendations(initialRecommendations);
      return;
    }

    const fetchRecommendations = async () => {
      if (!category) {
        console.log('No category provided, skipping recommendations fetch');
        return;
      }

      try {
        console.log('Fetching recommendations for category:', category);
        
        // Check if the recommendations table exists and has data
        const { data, error } = await supabase
          .from('recommendations')
          .select('title, category, explanation, imageUrl')
          .eq('category', category)
          .limit(3);

        if (error) {
          console.error('Supabase error fetching recommendations:', error.message, error.code, error.details);
          
          // Provide more specific error handling for common errors
          if (error.code === 'PGRST205') {
            console.warn('Recommendations table does not exist in the database. This is expected if the table hasn\'t been created yet.');
            console.info('To fix this, create the recommendations table using the DATABASE_SETUP.md guide.');
          } else if (error.code === 'PGRST116') {
            console.warn('Recommendations table does not exist or is not accessible');
          } else if (error.code === '42P01') {
            console.warn('Recommendations table not found in database');
          }
          
          // Set empty recommendations on error to prevent UI issues
          setRecommendations([]);
          return;
        }

        console.log('Recommendations data received:', data);

        const formattedRecommendations = data?.map(rec => ({
          title: rec.title,
          category: rec.category,
          explanation: rec.explanation,
          imageUrl: rec.imageUrl
        })) || [];

        setRecommendations(formattedRecommendations);
      } catch (error) {
        console.error('Unexpected error fetching recommendations:', error);
        setRecommendations([]);
      }
    };

    // Only fetch recommendations if the table exists (you can set this to false to disable temporarily)
    const ENABLE_RECOMMENDATIONS = true;
    if (ENABLE_RECOMMENDATIONS) {
      fetchRecommendations();
    } else {
      console.log('Recommendations disabled');
      setRecommendations([]);
    }
  }, [category, supabase, initialRecommendations]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const hasConversationStarted = chatHistory.length > 0;

  const handleSendMessage = async (messageOverride?: string) => {
    if (queryLimitReached) {
      alert('You have reached the query limit for this session.');
      return;
    }

    const message = messageOverride || userInput.trim();
    if (!message) return;

    setIsLoading(true);
    setUserInput('');

    // Add user message to chat history
    const newUserMessage: Message = { role: 'user', content: message };
    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      // Save user message to database
      await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          content: message,
          role: 'user',
          user_id: userId
        });

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({
          message,
          category: category,
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant response to chat history
      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setChatHistory(prev => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          content: data.response,
          role: 'assistant',
          user_id: userId
        });

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat history
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    window.location.href = '/';
  };

  const openModal = (recommendation: Recommendation) => {
    // Simple alert for now - you can implement a proper modal later
    alert(`${recommendation.title}\n\n${recommendation.explanation}`);
  };

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
    const Icon = category ? ICONS[category] : Bot;
    
    return (
      <div className={`transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col flex-shrink-0 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 md:w-20 p-0 md:p-2 items-center'}`}>
        <div className={`flex items-center mb-4 pb-4 border-b border-border ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <button onClick={() => window.location.href = '/'} className={`flex items-center gap-2 ${isSidebarOpen ? 'flex' : 'hidden'}`}>
            <Zap className="text-secondary" />
            <span className="text-xl font-bold">Zappy</span>
          </button>
          
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-muted-foreground/60 hover:bg-background">
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>
        
        {/* Session History Section */}
        <div className={`mb-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <button 
            onClick={() => setShowSessionHistory(!showSessionHistory)}
            className="w-full flex items-center justify-between p-2 rounded-lg text-muted-foreground hover:bg-background transition-colors"
          >
            <div className="flex items-center gap-2">
              <History size={18} />
              <span className="text-sm font-medium">Session History</span>
            </div>
            <ChevronRight className={`transition-transform ${showSessionHistory ? 'rotate-90' : ''}`} size={16} />
          </button>
          
          {showSessionHistory && (
            <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    // Navigate to the new session and reload the page to get fresh data
                    window.location.href = `/chat/${session.id}`;
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs hover:bg-background transition-colors ${
                    sessionId === session.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      session.category === 'Game' ? 'bg-purple-500' :
                      session.category === 'Movie' ? 'bg-blue-500' :
                      session.category === 'TV Series' ? 'bg-green-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium">{session.category}</div>
                      <div className="text-xs opacity-70">
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className={`text-sm font-semibold text-muted-foreground mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>Recommendations</div>
          <ul className="flex flex-col gap-2">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <li key={index}>
                  <button 
                    onClick={() => openModal(rec)} 
                    className={`w-full text-left p-3 rounded-lg text-card-foreground/80 hover:bg-background transition-colors flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}
                  >
                    <Icon className="text-primary flex-shrink-0" size={20} />
                    <span className={`truncate ${isSidebarOpen ? 'inline' : 'hidden'}`}>{rec.title}</span>
                  </button>
                </li>
              ))
            ) : (
              <li>
                <div className={`text-xs text-muted-foreground/60 italic p-3 text-center ${isSidebarOpen ? 'block' : 'hidden'}`}>
                  No recommendations available for {category || 'this category'}
                </div>
              </li>
            )}
          </ul>
        </div>
        
        <div className={`mt-auto pt-4 border-t border-border flex flex-col gap-2 ${isSidebarOpen ? '' : 'w-full px-2'}`}>
          {/* Profile Button */}
          <button 
            onClick={() => window.location.href = '/profile'} 
            className={`w-full bg-secondary text-secondary-foreground font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2 ${isSidebarOpen ? 'px-4' : 'justify-center'}`}
          >
            <User size={18} className="flex-shrink-0" />
            <span className={`font-medium ${isSidebarOpen ? 'inline' : 'hidden'}`}>Profile</span>
          </button>
          
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
    <div className="flex w-full h-screen">
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
                {category ? `Ready to discuss ${category}s?` : "Let's find something great!"}
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