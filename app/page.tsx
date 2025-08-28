"use client";

import { useState, useEffect, useRef } from 'react';
import { initialQuestion, questionSets } from '@/lib/questions';
import { RecommendationCard } from '@/components/recommendation-card';
import { ChatMessage } from '@/components/chat-message';
import { RecommendationModal } from '@/components/recommendation-modal';
import Groq from 'groq-sdk';
import { useTheme } from 'next-themes';
import { Sun, Moon, Send, RefreshCw, Bot, Film, Gamepad2, CornerDownLeft } from 'lucide-react';

// Type definitions
interface Recommendation { title: string; category: string; explanation: string; }
interface Message { role: 'user' | 'assistant'; content: string; }
type Category = 'Game' | 'Anime' | 'Movie';

const predefinedPrompts = [
  "Tell me more about the first recommendation.",
  "Why did you choose these for me?",
  "Give me one more recommendation.",
  "Which one is the most critically acclaimed?",
];

export default function Home() {
  // State for "Other" functionality
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherAnswerText, setOtherAnswerText] = useState('');

  // Core application state
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appState, setAppState] = useState<'questionnaire' | 'recommendations' | 'chat'>('questionnaire');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<Recommendation | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  const groq = new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY, dangerouslyAllowBrowser: true });

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const userMessagesCount = chatHistory.filter(msg => msg.role === 'user').length;
    if (userMessagesCount === 15) alert("You're approaching the conversation limit!");
    if (userMessagesCount >= 20) {
        alert("Conversation limit reached. Starting over!");
        handleNewRecommendation();
    }
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
    if (otherAnswerText.trim()) {
      handleAnswer(otherAnswerText.trim());
    }
  };

  const getRecommendations = async (finalAnswers: string[]) => {
    setIsLoading(true);
    const category = finalAnswers[0];
    const userPreferences = finalAnswers.slice(1).join(', ');
    const prompt = `You are Zappy, an expert recommender for ${category}s. A user has provided the following preferences: ${userPreferences}. Based ONLY on these preferences, provide exactly three ${category} recommendations. Format the output as a valid JSON array of objects. Each object must have "title", "category", and "explanation" keys. The "category" must be "${category}". Do not include any other text outside the JSON array.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: 'json_object' },
      });
      const responseContent = completion.choices[0]?.message?.content;
      if (responseContent) {
        const parsedResponse = JSON.parse(responseContent);
        let potentialArray = Array.isArray(parsedResponse) ? parsedResponse : Object.values(parsedResponse)[0];
        if (Array.isArray(potentialArray)) {
            setRecommendations(potentialArray as Recommendation[]);
            const welcomeMessage: Message = { role: 'assistant', content: `Hi there! I'm Zappy. Based on your choices, here are a few ${category} recommendations for you. Feel free to ask me anything about them!` };
            setChatHistory([welcomeMessage]);
        } else { console.error("Invalid response format", parsedResponse); }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const message = messageOverride || userInput;
    if (!message.trim()) return;

    const newUserMessage: Message = { role: 'user', content: message };
    const newChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(newChatHistory);
    setUserInput('');
    setIsLoading(true);

    const contextPrompt = `You are Zappy, a helpful and friendly assistant specializing in games, anime, and movies. The user was just recommended the following: ${recommendations.map(r => r.title).join(', ')}. Your instructions are: 1. Only answer questions related to these recommendations or the general topics of games, anime, and movies. 2. If the user asks anything outside this scope, you MUST politely decline. 3. Keep your answers concise.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'system', content: contextPrompt }, ...newChatHistory],
        model: 'llama3-70b-8192',
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

  const handlePredefinedPromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const openModal = (recommendation: Recommendation) => {
    setModalContent(recommendation);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleNewRecommendation = () => {
    setSelectedCategory(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setRecommendations([]);
    setChatHistory([]);
    setUserInput('');
    setAppState('questionnaire');
    setIsOtherSelected(false);
    setOtherAnswerText('');
  };

  const renderThemeChanger = () => {
    if (!isMounted) return <div className="w-8 h-8" />;
    return (
        <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
  };

  const renderContent = () => {
    if (appState === 'questionnaire') {
      const currentQ = !selectedCategory ? initialQuestion : questionSets[selectedCategory][currentQuestionIndex];
      const progressText = selectedCategory ? `Question ${currentQuestionIndex + 2} of 5` : "Question 1 of 5";
      const optionsLayout = !selectedCategory ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4";

      return (
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl border dark:border-slate-700">
            <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">{currentQ.text}</h2>
            {isOtherSelected ? (
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  value={otherAnswerText}
                  onChange={(e) => setOtherAnswerText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleOtherSubmit()}
                  placeholder="Type your answer here..."
                  className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleOtherSubmit}
                    className="flex-grow p-4 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setIsOtherSelected(false)}
                    className="p-4 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                    title="Go back to options"
                  >
                    <CornerDownLeft size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={optionsLayout}>
                {currentQ.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="p-4 rounded-xl text-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-colors duration-200"
                  >
                    {option}
                  </button>
                ))}
                {selectedCategory && (
                  <button
                    key="other"
                    onClick={() => setIsOtherSelected(true)}
                    className="p-4 rounded-xl text-lg bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-colors duration-200"
                  >
                    Other
                  </button>
                )}
              </div>
            )}
            <div className="mt-6 text-center text-sm text-slate-500">{progressText}</div>
          </div>
        </div>
      );
    }

    if (isLoading && recommendations.length === 0) {
      return (
         <div className="text-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto"></div>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Zappy is thinking...</p>
         </div>
      );
    }
    
    if (appState === 'recommendations' && recommendations.length > 0) {
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold text-center mb-6 text-slate-900 dark:text-white">Here are your recommendations!</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {recommendations.map((rec, index) => <RecommendationCard key={index} {...rec} />)}
                </div>
                <div className="text-center mt-8">
                    <button 
                        onClick={() => setAppState('chat')}
                        className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105"
                    >
                        Discuss with Zappy
                    </button>
                </div>
            </div>
        );
    }
    
    if (appState === 'chat') {
      const ICONS = { Game: Gamepad2, Anime: Bot, Movie: Film };
      const Icon = selectedCategory ? ICONS[selectedCategory] : Bot;

      return (
        <div className="flex w-full h-full">
          <div className="hidden md:flex flex-col w-1/4 xl:w-1/5 bg-white dark:bg-slate-800 p-6 border-r border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Your Recommendations</h3>
            <ul className="flex flex-col gap-2">
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <button 
                    onClick={() => openModal(rec)}
                    className="w-full text-left p-3 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-3"
                  >
                    <Icon className="text-blue-500 flex-shrink-0" size={20} />
                    <span className="truncate">{rec.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col flex-grow h-full bg-slate-100 dark:bg-slate-900">
            <div ref={chatContainerRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
              {chatHistory.map((msg, index) => <ChatMessage key={index} {...msg} />)}
              {isLoading && chatHistory.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">Z</div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 w-full max-w-4xl mx-auto">
              {chatHistory.length <= 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  {predefinedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePredefinedPromptClick(prompt)}
                      className="p-3 text-sm bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-full px-4 py-2 shadow-lg border dark:border-slate-700">
                 <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                  placeholder="Ask Zappy anything about your recommendations..."
                  className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  disabled={isLoading}
                 />
                 <button onClick={() => handleSendMessage()} disabled={isLoading} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-400">
                  <Send size={20} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <main className={
        appState === 'chat'
            ? "h-screen w-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden"
            : "flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 transition-colors duration-300"
    }>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
                onClick={handleNewRecommendation}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                title="Start a new recommendation"
            >
                <RefreshCw size={18} />
                <span className="hidden sm:inline text-sm font-medium">Start Over</span>
            </button>
            {renderThemeChanger()}
        </div>
        
        <div className={
            appState === 'chat'
                ? "h-full w-full"
                : "w-full h-full flex items-center justify-center"
        }>
             {renderContent()}
        </div>

        <RecommendationModal recommendation={modalContent} onClose={closeModal} />
    </main>
  );
}