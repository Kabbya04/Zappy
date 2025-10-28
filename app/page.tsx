// app/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Groq from 'groq-sdk';
import { useTheme } from 'next-themes';
import { getLatestMedia, getTVDBImage, getConversationalContext } from '@/lib/tvdb';
import { getLatestGames, getRawgImage } from '@/lib/rawg';
import { formatImageUrl } from '@/lib/utils';
import { initialQuestion, questionSets } from '@/lib/questions';
import LandingPage from '@/app/landing/page';
import QuestionnairePage from '@/app/questionnaire/page';
import RecommendationsPage from '@/app/recommendations/page';
import ChatPage from '@/app/chat/page';
import { RecommendationModal } from '@/components/recommendation-modal';

// --- Interface Definitions ---
export interface Recommendation { 
  title: string; 
  category: string; 
  explanation: string; 
  imageUrl?: string; 
}

interface Message { 
  role: 'user' | 'assistant'; 
  content: string; 
}

type Category = keyof typeof questionSets;

const cleanTitleForSearch = (title: string): string => {
  return title.replace(/\s*\(Season\s\d+\)/i, '').replace(/\s*:\s*(Part|Season)\s\d+/i, '').replace(/\s*-\s*Season\s\d+/i, '').trim();
};

// --- Main Page Component ---
export default function Home() {
  const [showLanding, setShowLanding] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  
  const [tempAnswer, setTempAnswer] = useState<string | null>(null);

  const [latestMoviesContext, setLatestMoviesContext] = useState('');
  const [latestTVContext, setLatestTVContext] = useState('');
  const [latestAnimeContext, setLatestAnimeContext] = useState('');
  const [latestGamesContext, setLatestGamesContext] = useState('');
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);

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

  const handleOptionSelect = (option: string) => {
    if (option === tempAnswer) {
      setTempAnswer(null); 
    } else {
      setTempAnswer(option);
      if (option !== 'Other') {
        setOtherAnswerText(''); 
      }
    }
  };

  const handleNext = () => {
    const answerToSubmit = tempAnswer === 'Other' ? otherAnswerText.trim() : tempAnswer;

    if (!answerToSubmit) return;

    if (!selectedCategory) {
      setSelectedCategory(answerToSubmit as Category);
      setAnswers([answerToSubmit]);
    } else {
      const newAnswers = [...answers, answerToSubmit];
      setAnswers(newAnswers);
      const questionSet = questionSets[selectedCategory];
      if (currentQuestionIndex < questionSet.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setAppState('recommendations');
        getRecommendations(newAnswers);
      }
    }
    setTempAnswer(null);
    setOtherAnswerText('');
  };

  const handleBack = () => {
    setTempAnswer(null);
    setOtherAnswerText('');

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, prev.length - 1));
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setAnswers([]);
    }
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
            const recommendationsWithImages = await Promise.all(
              rawRecommendations.map(async (rec) => {
                const cleanedTitle = cleanTitleForSearch(rec.title);
                const searchType = category === 'Movie' ? 'movie' : 'series';
                const imageUrl = category === 'Game'
                  ? await getRawgImage(cleanedTitle)
                  : await getTVDBImage(cleanedTitle, searchType, category);
                const formattedImageUrl = imageUrl ? formatImageUrl(imageUrl) : null;
                return { ...rec, title: cleanedTitle, category, imageUrl: formattedImageUrl || undefined };
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

    let generalContext = '';
    if (selectedCategory) {
        switch (selectedCategory) {
            case 'Game': generalContext = latestGamesContext; break;
            case 'Movie': generalContext = latestMoviesContext; break;
            case 'Anime': generalContext = latestAnimeContext; break;
            case 'TV Series': generalContext = latestTVContext; break;
        }
    }
    
    const specificContextData = await getConversationalContext(message);

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
    setTempAnswer(null);
    setOtherAnswerText('');
    setSessionId(id => id + 1);
  };

  const handleGoToLanding = () => {
    handleStartOver();
    setShowLanding(true);
  };
  
  if (showLanding) {
    return <LandingPage setShowLanding={setShowLanding} isContextLoading={isContextLoading} />;
  }

  const renderContent = () => {
    switch (appState) {
      case 'questionnaire':
        return (
          <QuestionnairePage
            selectedCategory={selectedCategory}
            currentQuestionIndex={currentQuestionIndex}
            tempAnswer={tempAnswer}
            otherAnswerText={otherAnswerText}
            setOtherAnswerText={setOtherAnswerText}
            handleOptionSelect={handleOptionSelect}
            handleBack={handleBack}
            handleNext={handleNext}
            handleStartOver={handleStartOver}
            totalQuestions={5}
          />
        );
      case 'recommendations':
        return (
          <RecommendationsPage
            recommendations={recommendations}
            isLoading={isLoading}
            setAppState={setAppState}
            selectedCategory={selectedCategory} // Pass the category down
          />
        );
      case 'chat':
        return (
          <ChatPage
            chatHistory={chatHistory}
            userInput={userInput}
            setUserInput={setUserInput}
            isLoading={isLoading}
            handleSendMessage={handleSendMessage}
            selectedCategory={selectedCategory}
            recommendations={recommendations}
            openModal={openModal}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            handleStartOver={handleStartOver}
            handleGoToLanding={handleGoToLanding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* MODIFICATION: The main tag now only provides the background. The child div handles all layout. */}
      <main className={`transition-all duration-300 bg-gradient-to-br from-background to-gradient-accent/20 text-foreground ${modalContent ? 'blur-sm' : ''}`}>
        <div className="w-full h-full">
          {renderContent()}
        </div>
      </main>
      <RecommendationModal recommendation={modalContent} onClose={closeModal} />
    </>
  );
}