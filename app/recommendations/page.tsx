// app/recommendations/page.tsx

"use client";

import { RecommendationCard } from '@/components/recommendation-card';
import { Moon, Sun, Zap, MessageCircle, Mail, Globe, HelpCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

interface Recommendation {
  title: string;
  category: string;
  explanation: string;
  imageUrl?: string;
}

interface RecommendationsPageProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  setAppState: (state: 'questionnaire' | 'recommendations' | 'chat') => void;
  selectedCategory: string | null; // Add selectedCategory to props
}

export default function RecommendationsPage({
  recommendations,
  isLoading,
  setAppState,
  selectedCategory, // Destructure the prop
}: RecommendationsPageProps) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const categoryTitle = selectedCategory ? selectedCategory.replace(/([A-Z])/g, ' $1').trim() : "Selections";

  // Loading state - now correctly centered within its own full-page container
  if (isLoading && recommendations.length === 0) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Zappy is thinking...</p>
        </div>
      </div>
    );
  }
  
  // Render the full recommendation page layout
  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-background to-gradient-accent/20 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex items-center justify-between w-full py-6">
        <div className="flex items-center gap-2">
          <Zap className="text-primary" />
          <span className="text-2xl font-bold">Zappy</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-full text-foreground/60 bg-card/50 hover:bg-card/80 transition-colors"
            aria-label="Toggle theme"
          >
            {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
          </button>
          <button 
            onClick={() => setAppState('chat')}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <MessageCircle size={18} />
            Chat with Zappy
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          The Critic's Corner: <span className="text-primary">{categoryTitle} Selections</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={rec.title || index} {...rec} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto border-t border-border/20">
          <div className="flex flex-col items-center justify-center gap-4">
             <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground">About</a>
                <a href="#" className="hover:text-foreground">Privacy Policy</a>
                <a href="#" className="hover:text-foreground">Contact</a>
             </div>
             <div className="flex items-center gap-4 text-muted-foreground">
                <a href="#" className="hover:text-foreground"><Mail size={18} /></a>
                <a href="#" className="hover:text-foreground"><Globe size={18} /></a>
                <a href="#" className="hover:text-foreground"><HelpCircle size={18} /></a>
             </div>
             <p className="text-xs text-muted-foreground/70 mt-4">
                © {new Date().getFullYear()} Zappy. All Rights Reserved.
             </p>
          </div>
      </footer>
    </div>
  );
}