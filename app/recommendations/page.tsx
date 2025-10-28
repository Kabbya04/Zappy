"use client";

import { RecommendationCard } from '@/components/recommendation-card';
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
}

export default function RecommendationsPage({
  recommendations,
  isLoading,
  setAppState
}: RecommendationsPageProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log('Rendering recommendations in initial section:', recommendations);
  }, [recommendations]);

  if (isLoading && recommendations.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Zappy is thinking...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length > 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-center mb-6">{`Here are your recommendations!`}</h2>
          <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} {...rec} />
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => setAppState('chat')} 
              className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
            >
              Discuss with Zappy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}