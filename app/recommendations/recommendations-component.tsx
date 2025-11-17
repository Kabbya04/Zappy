// app/recommendations/page.tsx

"use client";

import { RecommendationCard } from '@/components/recommendation-card';
import { Moon, Sun, Zap, User, Mail, Globe, HelpCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';


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
  setSelectedSessionId: (sessionId: string) => void;
  selectedCategory: string | null;
}

export default function RecommendationsPage({
  recommendations,
  isLoading,
  setAppState,
  setSelectedSessionId,
  selectedCategory,
}: RecommendationsPageProps) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, [supabase.auth]);

  const categoryTitle = selectedCategory ? selectedCategory.replace(/([A-Z])/g, ' $1').trim() : "Selections";

  const handleDiscuss = async () => {
    console.log('=== DEBUG: Discuss button clicked ===');
    console.log('User state:', user);
    console.log('Current URL:', window.location.href);
    
    if (!user) {
      console.log('No user found, redirecting to auth');
      window.location.href = '/auth';
      return;
    }

    console.log('Creating session for user:', user.id);
    
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            user_id: user.id,
            category: selectedCategory,
            recommendations: recommendations,
          },
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Error creating session:', error);
        alert('Failed to create session. Please try again.');
        return;
      }

      if (data) {
        console.log('Session created successfully:', data.id);
        console.log('Setting selected session ID and app state...');
        setSelectedSessionId(data.id);
        setAppState('chat');
        console.log('=== DEBUG: Navigation should occur now ===');
      }
    } catch (error) {
      console.error('Exception in handleDiscuss:', error);
      alert('An error occurred. Please try again.');
    }
  };

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
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-background to-gradient-accent/20 px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between w-full py-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <Zap className="text-primary" />
          <span className="text-2xl font-bold">Zappy</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-foreground/60 hover:bg-card/50"
            aria-label="Toggle theme"
          >
            {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
          </button>
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border">
            <User size={18} className="text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          The Critic&apos;s Corner: <span className="text-primary">{categoryTitle} Selections</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {recommendations.map((rec, index) => (
            <RecommendationCard key={rec.title || index} {...rec} />
          ))}
        </div>

        <div className="mt-16 text-center">
            <button
              onClick={handleDiscuss}
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
            >
              Discuss with Zappy
            </button>
        </div>
      </main>

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