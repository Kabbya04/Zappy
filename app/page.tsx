"use client";

import { useState, useEffect, useRef } from 'react';
import Groq from 'groq-sdk';
import { useTheme } from 'next-themes';
import { RefreshCw, Zap } from 'lucide-react';
import { getLatestMedia, getTVDBImage, getConversationalContext } from '@/lib/tvdb';
import { getLatestGames, getRawgImage } from '@/lib/rawg';
import { formatImageUrl } from '@/lib/utils';
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

type Category = 'Game' | 'Anime' | 'Movie' | 'TV Series';

const cleanTitleForSearch = (title: string): string => {
  return title.replace(/\s*\(Season\s\d+\)/i, '').replace(/\s*:\s*(Part|Season)\s\d+/i, '').replace(/\s*-\s*Season\s\d+/i, '').trim();
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
  const { theme, setTheme } = useTheme();
  
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
                console.log(`Cleaned title for search: "${cleanedTitle}" (original: "${rec.title}")`); // <-- ADDED LOG
                const searchType = category === 'Movie' ? 'movie' : 'series';
                const imageUrl = category === 'Game'
                  ? await getRawgImage(cleanedTitle)
                  : await getTVDBImage(cleanedTitle, searchType, category);
                console.log(`Image URL for "${cleanedTitle}":`, imageUrl); // <-- EXISTING LOG
                const formattedImageUrl = imageUrl ? formatImageUrl(imageUrl) : null;
                console.log(`Formatted image URL for "${cleanedTitle}":`, formattedImageUrl); // <-- EXISTING LOG
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
    return <LandingPage setShowLanding={setShowLanding} isContextLoading={isContextLoading} />;
  }

  const renderContent = () => {
    switch (appState) {
      case 'questionnaire':
        return (
          <QuestionnairePage
            selectedCategory={selectedCategory}
            currentQuestionIndex={currentQuestionIndex}
            isOtherSelected={isOtherSelected}
            otherAnswerText={otherAnswerText}
            setIsOtherSelected={setIsOtherSelected}
            setOtherAnswerText={setOtherAnswerText}
            handleAnswer={handleAnswer}
            handleOtherSubmit={handleOtherSubmit}
          />
        );
      case 'recommendations':
        return (
          <RecommendationsPage
            recommendations={recommendations}
            isLoading={isLoading}
            setAppState={setAppState}
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
      <main className={`transition-all duration-300 ${appState === 'chat' ? "h-screen w-screen" : "flex flex-col items-center justify-center min-h-screen p-4"} bg-gradient-to-br from-background to-gradient-accent/20 text-foreground ${modalContent ? 'blur-sm' : ''}`}>
        <div className={appState === 'chat' ? "h-full w-full" : "w-full h-full flex items-center justify-center"}>
          {renderContent()}
        </div>
      </main>
      <RecommendationModal recommendation={modalContent} onClose={closeModal} />
    </>
  );
}

// --- Question Sets ---
const questionSets = {
  Game: [
    { text: "What type of games do you usually play?", options: ["Action/Adventure", "RPGs", "Strategy", "Indie", "Sports/Racing", "Puzzle/Simulation"] },
    { text: "What platforms do you play on?", options: ["PC", "PlayStation", "Xbox", "Nintendo Switch", "Mobile"] },
    { text: "What are you looking for in your next game?", options: ["Challenging Gameplay", "Great Story", "Multiplayer Fun", "Beautiful Graphics", "Relaxing Experience"] },
    { text: "Any specific genre you want to try?", options: ["Open World", "Turn-Based", "Real-Time Strategy", "Survival", "Co-op", "Competitive"] }
  ],
  Anime: [
    { text: "What type of anime do you typically enjoy?", options: ["Action/Adventure", "Romance", "Comedy", "Drama", "Fantasy", "Sci-Fi"] },
    { text: "Do you prefer longer series or shorter ones?", options: ["Short (12-26 episodes)", "Long (50+ episodes)", "Doesn't matter"] },
    { text: "What appeals to you most in an anime?", options: ["Art Style", "Story/Plot", "Characters", "Soundtrack", "Animation Quality"] },
    { text: "Any specific themes you're interested in?", options: ["School Life", "Mecha", "Slice of Life", "Psychological", "Supernatural", "Historical"] }
  ],
  Movie: [
    { text: "What genres of movies do you enjoy?", options: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"] },
    { text: "Do you prefer recent releases or classics?", options: ["Recent (last 5 years)", "Modern Classics (last 20 years)", "All-Time Classics", "Mix of both"] },
    { text: "What's most important to you in a movie?", options: ["Great Story", "Amazing Visuals", "Strong Characters", "Cinematography", "Soundtrack"] },
    { text: "Any specific themes or settings you like?", options: ["Superheroes", "Historical", "Fantasy", "Realistic", "Space/Technology", "Mystery"] }
  ],
  "TV Series": [
    { text: "What genres of TV series do you enjoy?", options: ["Action/Adventure", "Comedy", "Drama", "Crime/Mystery", "Fantasy", "Documentary"] },
    { text: "How do you usually watch TV series?", options: ["Binge-watching", "Episode by episode", "Season by season"] },
    { text: "What's most important to you in a TV series?", options: ["Engaging Plot", "Character Development", "Production Quality", "Pacing", "Realistic Dialogue"] },
    { text: "Any specific themes or settings you prefer?", options: ["Contemporary", "Historical", "Fantasy", "Realistic", "Space/Technology", "Workplace"] }
  ]
};

const initialQuestion = {
  text: "What type of entertainment are you in the mood for?",
  options: ["Game", "Anime", "Movie", "TV Series"]
};