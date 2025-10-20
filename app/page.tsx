"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { LampContainer } from "@/components/lamp";
import { initialQuestion, questionSets } from '@/lib/questions';
import { RecommendationCard } from '@/components/recommendation-card';
import { ChatMessage } from '@/components/chat-message';
import { RecommendationModal } from '@/components/recommendation-modal';
import Groq from 'groq-sdk';
import { useTheme } from 'next-themes';
import { Sun, Moon, Send, RefreshCw, Bot, Film, Gamepad2, CornerDownLeft, Zap, PanelLeftClose, PanelLeftOpen, Tv2 } from 'lucide-react';
import { getLatestMedia, getTVDBImage, getConversationalContext } from '@/lib/tvdb';
import { getLatestGames, getRawgImage } from '@/lib/rawg';

// --- Interface Definitions ---
interface Recommendation { title: string; category: string; explanation: string; imageUrl?: string; }
interface Message { role: 'user' | 'assistant'; content: string; }
type Category = 'Game' | 'Anime' | 'Movie' | 'TV Series';

const cleanTitleForSearch = (title: string): string => {
  return title.replace(/\s*\(Season\s\d+\)/i, '').replace(/\s*:\s*(Part|Season)\s\d+/i, '').replace(/\s*-\s*Season\s\d+/i, '').trim();
};

const predefinedPrompts = [
  "Tell me more about the first recommendation.",
  "Why did you choose these for me?",
  "Give me one more recommendation.",
  "Which one is the most critically acclaimed?",
];

// --- ChatInput Component ---
interface ChatInputProps {
  userInput: string;
  setUserInput: (value: string) => void;
  isLoading: boolean;
  handleSendMessage: () => void;
  hasConversationStarted: boolean;
  handlePredefinedPromptClick: (prompt: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ userInput, setUserInput, isLoading, handleSendMessage, hasConversationStarted, handlePredefinedPromptClick }) => {
  return (
    <div className="w-full">
      {!hasConversationStarted && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {predefinedPrompts.map((prompt) => (
            <button key={prompt} onClick={() => handlePredefinedPromptClick(prompt)} className="p-3 text-sm bg-card/50 border border-border rounded-lg text-left text-foreground/70 hover:bg-card/70 transition-colors">
              {prompt}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center bg-card rounded-2xl p-2.5 shadow-lg border border-border">
         <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder="Ask Zappy about your recommendations..." className="w-full bg-transparent text-foreground focus:outline-none px-3" disabled={isLoading} />
         <button onClick={handleSendMessage} disabled={isLoading} className="p-2 w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-muted transition-colors">
          <Send size={20} />
         </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherAnswerText, setOtherAnswerText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState<'questionnaire' | 'recommendations' | 'chat'>('questionnaire');
  const [modalContent, setModalContent] = useState<Recommendation | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  
  const [latestMoviesContext, setLatestMoviesContext] = useState('');
  const [latestTVContext, setLatestTVContext] = useState('');
  const [latestAnimeContext, setLatestAnimeContext] = useState('');
  const [latestGamesContext, setLatestGamesContext] = useState('');
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);
  
  useEffect(() => {
    const fetchInitialContext = async () => {
      setIsContextLoading(true);
      console.log("Fetching initial context for all categories...");
      try {
        const [movies, series, games] = await Promise.all([
          getLatestMedia('movie'),
          getLatestMedia('series'),
          getLatestGames(),
        ]);
        setLatestMoviesContext(movies || '');
        setLatestTVContext(series || '');
        setLatestAnimeContext(series || '');
        setLatestGamesContext(games || '');
        console.log("Initial context fetched successfully.");
      } catch (error) {
        console.error("Failed to fetch initial context:", error);
        alert("Could not load the latest data. Recommendations may be limited.");
      } finally {
        setIsContextLoading(false);
      }
    };
    fetchInitialContext();
  }, [sessionId]);

  useEffect(() => {
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [chatHistory]);

  const handleAnswer = (answer: string) => {
    if (!selectedCategory) {
      setSelectedCategory(answer as Category);
      setAnswers([answer]);
    } else {
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      const questionSet = questionSets[selectedCategory];
      if (currentQuestionIndex < questionSet.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setAppState('recommendations');
        getRecommendations(newAnswers);
      }
    }
    setIsOtherSelected(false);
    setOtherAnswerText('');
  };

  const handleOtherSubmit = () => {
    if (otherAnswerText.trim()) handleAnswer(otherAnswerText.trim());
  };

  const getRecommendations = async (finalAnswers: string[]) => {
    const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true });
    setIsLoading(true);
    setRecommendations([]);

    const category = finalAnswers[0] as Category;
    const userPreferences = finalAnswers.slice(1).join(', ');

    let contextString = "";
    switch (category) {
      case 'Game': contextString = latestGamesContext; break;
      case 'Movie': contextString = latestMoviesContext; break;
      case 'Anime': contextString = latestAnimeContext; break;
      case 'TV Series': contextString = latestTVContext; break;
    }

    const contextForPrompt = contextString
        ? `To ensure your recommendations are current, use this list of recent and popular titles as a primary guide:\n${contextString}\n\n`
        : "";

    const prompt = `${contextForPrompt}You are Zappy, an expert recommender for ${category}s. A user has provided the following preferences: ${userPreferences}. Based on the user's preferences, and using the provided list as a guide for recent and popular titles, provide exactly three ${category} recommendations. You can use your own knowledge in addition to the list. Crucially, do not recommend any titles that have a release date in the future. Only recommend titles that are already released. Format the output as a valid JSON array of objects. Each object must have "title", "category", and "explanation" keys. Do not include any other text or explanations outside of the JSON array.`;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'openai/gpt-oss-120b',
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (responseContent) {
          const parsedResponse = JSON.parse(responseContent);
          const rawRecommendations = (Array.isArray(parsedResponse) ? parsedResponse : Object.values(parsedResponse)[0]) as Recommendation[];
          
          if (Array.isArray(rawRecommendations)) {
            console.log("Fetching images for recommendations...");
            
            const recommendationsWithImages = await Promise.all(
              rawRecommendations.map(async (rec) => {
                const cleanedTitle = cleanTitleForSearch(rec.title);
                const searchType = category === 'Movie' ? 'movie' : 'series';
                const imageUrl = category === 'Game'
                  ? await getRawgImage(cleanedTitle)
                  : await getTVDBImage(cleanedTitle, searchType, category);
                return { ...rec, title: cleanedTitle, category, imageUrl: imageUrl || undefined };
              })
            );

            setRecommendations(recommendationsWithImages);
          } else {
            throw new Error("Parsed JSON from LLM was not a valid array.");
          }
      } else {
        throw new Error("Empty response from LLM.");
      }
    } catch (error) { 
      console.error("Error in recommendation pipeline:", error);
      alert("Sorry, I couldn't get recommendations for you. Please try again.");
      handleStartOver();
    } finally {
      setIsLoading(false);
    }
  };
  
  // MODIFICATION: The entire conversational logic is updated for better context handling.
  const handleSendMessage = async (messageOverride?: string) => {
    const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true });
    if (chatHistory.length === 0) setIsSidebarOpen(true);
    const message = messageOverride || userInput;
    if (!message.trim()) return;
    
    const newUserMessage: Message = { role: 'user', content: message };
    const newChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(newChatHistory);
    setUserInput('');
    setIsLoading(true);

    // 1. Get the general session memory for the current category.
    let generalContext = '';
    if (selectedCategory) {
        switch (selectedCategory) {
            case 'Game': generalContext = latestGamesContext; break;
            case 'Movie': generalContext = latestMoviesContext; break;
            case 'Anime': generalContext = latestAnimeContext; break;
            case 'TV Series': generalContext = latestTVContext; break;
        }
    }
    
    // 2. Search for specific context based on the user's actual message.
    console.log(`Searching for conversational context based on: "${message}"`);
    const specificContextData = await getConversationalContext(message);

    // 3. Build a more authoritative prompt.
    const generalContextForPrompt = generalContext
      ? `[GENERAL CONTEXT - A list of recent and popular titles for your reference]:\n${generalContext}\n\n`
      : "";

    const specificContextForPrompt = specificContextData
      ? `[SPECIFIC INFORMATION - This is highly relevant to the user's last message]:\n${specificContextData}\n\n`
      : "";

    const contextPrompt = `You are Zappy, a helpful and knowledgeable entertainment recommender.
${generalContextForPrompt}${specificContextForPrompt}
Your instructions are as follows:
1.  **Prioritize Information**: Your primary goal is to use the real-time information provided above. If [SPECIFIC INFORMATION] is available, it is the most important and should be treated as the source of truth for your answer. If it is empty, use the [GENERAL CONTEXT] as a reference for recent titles. Only if both are empty should you rely solely on your own internal knowledge.
2.  **Be Honest**: If you cannot find the requested information in the provided context or your own knowledge, clearly state that you don't have details about it. Do not invent or hallucinate information.
3.  **Stay on Topic**: Only answer questions related to entertainment (games, movies, anime, TV). Politely decline any other topics.
4.  **Be Concise**: Keep your answers helpful and to the point.
The user was previously recommended: ${recommendations.map(r => r.title).join(', ')}.`;
    
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'system', content: contextPrompt }, ...newChatHistory],
            model: 'openai/gpt-oss-120b',
        });
        const assistantResponse = completion.choices[0]?.message?.content || "I'm not sure how to respond.";
        setChatHistory(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
        console.error("Error fetching chat response:", error);
        setChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, an error occurred." }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePredefinedPromptClick = (prompt: string) => { handleSendMessage(prompt); };
  const openModal = (recommendation: Recommendation) => { setModalContent(recommendation); };
  const closeModal = () => { setModalContent(null); };
  
  const handleStartOver = () => {
    setIsSidebarOpen(false);
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setRecommendations([]);
    setChatHistory([]);
    setUserInput('');
    setAppState('questionnaire');
    setIsOtherSelected(false);
    setOtherAnswerText('');
    setSessionId(id => id + 1);
  };

  const handleGoToLanding = () => {
    handleStartOver();
    setShowLanding(true);
  };
  
  if (showLanding) {
      if (isContextLoading) {
          return (
              <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-foreground">
                  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                  <p className="mt-4 text-lg text-muted-foreground">Warming up Zappy...</p>
              </div>
          );
      }
      return (
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-8 bg-gradient-to-br from-foreground to-secondary py-4 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent md:text-7xl"
            >
                Zappy ⚡
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 120 }}
                whileInView={{ opacity: 1, y: 20 }}
                transition={{
                    delay: 0.4,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-4 max-w-2xl text-center text-base md:text-lg text-foreground/70"
            >
                An AI-powered recommender that uses LLMs to suggest games, anime, and movies based on your tastes. Through natural conversation, it delivers smart, personalized picks—helping you discover your next favorite game, binge-worthy anime, or movie that perfectly matches your mood.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 140 }}
                whileInView={{ opacity: 1, y: 40 }}
                transition={{
                    delay: 0.5,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="mt-8 flex items-center space-x-4"
            >
                <button
                    onClick={() => setShowLanding(false)}
                    className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
                >
                    Get Started
                </button>
                 <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                    className="p-3 rounded-full text-foreground/60 hover:bg-card/50"
                 >
                    {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                </button>
            </motion.div>
        </LampContainer>
      );
  }

  // --- Main App Components ---
  const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="absolute top-4 right-4 flex items-center gap-4">
          <button onClick={handleStartOver} className="p-2 rounded-lg text-muted-foreground/60 hover:bg-card">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg text-muted-foreground/60 hover:bg-card">
            {isMounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
          </button>
        </div>
        {children}
      </div>
    );
  };
  
  const Sidebar: React.FC = () => {
    const ICONS = { Game: Gamepad2, Anime: Bot, Movie: Film, 'TV Series': Tv2 };
    const Icon = selectedCategory ? ICONS[selectedCategory] : Bot;
    return (
      <div className={`transition-all duration-300 ease-in-out bg-card border-r border-border flex flex-col flex-shrink-0 ${isSidebarOpen ? 'w-64 p-4' : 'w-0 md:w-20 p-0 md:p-2 items-center'}`}>
        <div className={`flex items-center mb-4 pb-4 border-b border-border ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          <button onClick={handleGoToLanding} className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
            <Zap className="text-secondary" />
            <span className="text-xl font-bold">Zappy</span>
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg text-muted-foreground/60 hover:bg-background">
            {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </button>
        </div>
        <div className="flex-grow overflow-y-auto overflow-x-hidden">
          <div className={`text-sm font-semibold text-muted-foreground mb-2 ${isSidebarOpen ? 'block' : 'hidden'}`}>Recommendations</div>
          <ul className="flex flex-col gap-2">
            {recommendations.map((rec, index) => (
              <li key={index}>
                <button onClick={() => openModal(rec)} className={`w-full text-left p-3 rounded-lg text-card-foreground/80 hover:bg-background transition-colors flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
                  <Icon className="text-primary flex-shrink-0" size={20} />
                  <span className={`truncate ${isSidebarOpen ? 'inline' : 'hidden'}`}>{rec.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto pt-4 border-t border-border flex flex-col gap-2">
          <button onClick={handleStartOver} className={`w-full p-3 rounded-lg text-card-foreground/80 hover:bg-background transition-colors flex items-center gap-3 ${isSidebarOpen && 'justify-center'}`}>
            <RefreshCw size={18} className="flex-shrink-0" />
            <span className={`font-medium ${isSidebarOpen ? 'inline' : 'hidden'}`}>Start Over</span>
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-full p-3 rounded-lg text-card-foreground/80 hover:bg-background transition-colors flex items-center gap-3 ${isSidebarOpen && 'justify-center'}`}>
            {isMounted && (theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />)}
            <span className={`font-medium ${isSidebarOpen ? 'inline' : 'hidden'}`}>{isMounted && (theme === 'dark' ? 'Light Theme' : 'Dark Theme')}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (appState === 'questionnaire') {
      const currentQ = !selectedCategory ? initialQuestion : questionSets[selectedCategory][currentQuestionIndex];
      const progressText = selectedCategory ? `Question ${currentQuestionIndex + 2} of 5` : "Question 1 of 5";
      const optionsLayout = !selectedCategory ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4";
      return (
        <PageWrapper>
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl border border-border">
              <h2 className="text-2xl font-bold text-center mb-6">{currentQ.text}</h2>
              {isOtherSelected ? (
                <div className="flex flex-col gap-4">
                  <input type="text" value={otherAnswerText} onChange={(e) => setOtherAnswerText(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleOtherSubmit()} placeholder="Type your answer here..." className="w-full p-4 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" autoFocus />
                  <div className="flex gap-3">
                    <button onClick={handleOtherSubmit} className="flex-grow p-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">Submit</button>
                    <button onClick={() => setIsOtherSelected(false)} className="p-4 rounded-xl bg-muted text-foreground hover:bg-muted/70 transition-colors" title="Go back to options"><CornerDownLeft size={24} /></button>
                  </div>
                </div>
              ) : (
                <div className={optionsLayout}>
                  {currentQ.options.map((option) => (
                    <button key={option} onClick={() => handleAnswer(option)} className="p-4 rounded-xl text-lg bg-background border border-border text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors duration-200">{option}</button>
                  ))}
                  {selectedCategory && (
                    <button key="other" onClick={() => setIsOtherSelected(true)} className="p-4 rounded-xl text-lg bg-background border border-border text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors duration-200">Other</button>
                  )}
                </div>
              )}
              <div className="mt-6 text-center text-sm text-muted-foreground">{progressText}</div>
            </div>
          </div>
        </PageWrapper>
      );
    }
    if (isLoading && recommendations.length === 0) {
      return (
        <PageWrapper>
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Zappy is thinking...</p>
          </div>
        </PageWrapper>
      );
    }
    if (appState === 'recommendations' && recommendations.length > 0) {
        return (
          <PageWrapper>
            <div className="text-center">
                <h2 className="text-3xl font-bold text-center mb-6">{`Here are your recommendations!`}</h2>
                <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
                    {recommendations.map((rec, index) => <RecommendationCard key={index} {...rec} />)}
                </div>
                <div className="text-center mt-8">
                    <button onClick={() => setAppState('chat')} className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105">Discuss with Zappy</button>
                </div>
            </div>
          </PageWrapper>
        );
    }
    if (appState === 'chat') {
      const hasConversationStarted = chatHistory.length > 0;
      return (
        <div className="flex w-full h-full">
          <Sidebar />
          <div className="flex flex-col flex-grow h-full bg-transparent">
            {hasConversationStarted ? (
              <div className="w-full max-w-2xl mx-auto flex flex-col h-full">
                <div ref={chatContainerRef} className="flex-grow pt-6 space-y-6 overflow-y-auto px-2">
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
                <div className="pt-4 pb-6 bg-transparent border-t border-border">
                  <ChatInput userInput={userInput} setUserInput={setUserInput} isLoading={isLoading} handleSendMessage={handleSendMessage} hasConversationStarted={hasConversationStarted} handlePredefinedPromptClick={handlePredefinedPromptClick} />
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex justify-center items-center p-4">
                <div className="flex flex-col items-center gap-8 text-center w-full max-w-2xl mx-auto">
                  <div className="flex flex-col items-center gap-4">
                    <Zap className="w-12 h-12 text-secondary" />
                    <h1 className="text-4xl md:text-5xl font-serif">{selectedCategory ? `Ready to discuss ${selectedCategory}s?` : "Let's find something great!"}</h1>
                  </div>
                  <ChatInput userInput={userInput} setUserInput={setUserInput} isLoading={isLoading} handleSendMessage={handleSendMessage} hasConversationStarted={hasConversationStarted} handlePredefinedPromptClick={handlePredefinedPromptClick} />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null; 
  };

  return (
    <>
      <main className={`transition-all duration-300 ${appState === 'chat' ? "h-screen w-screen" : "flex flex-col items-center justify-center min-h-screen p-4"} bg-gradient-to-br from-background to-gradient-accent/20 text-foreground ${modalContent ? 'blur-sm' : ''}`}>
          <div className={appState === 'chat' ? "h-full w-full" : "w-full h-full flex items-center justify-center"}>
               {renderContent()}
          </div>
      </main>
      <RecommendationModal recommendation={modalContent} onClose={closeModal} />
    </>
  );
}