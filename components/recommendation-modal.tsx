"use client";

import { X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface Recommendation {
  title: string;
  category: string;
  explanation: string;
}

interface RecommendationModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const RecommendationModal = ({ recommendation, onClose }: RecommendationModalProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      // Use global clientX/clientY for the fixed background-attachment effect
      card.style.setProperty('--mouse-x', `${e.clientX}px`);
      card.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!recommendation) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 p-4"
      onClick={onClose}
    >
      {/* This new div will be the positioning context for the button and the card */}
      <div 
        className="relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Card Itself */}
        <div 
          ref={cardRef}
          className="glow-card bg-card text-card-foreground rounded-2xl shadow-2xl max-w-lg w-full border border-border"
        >
          <div className="p-6 md:p-8 relative z-[1]">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
              {recommendation.category}
            </span>
            <h2 className="text-2xl font-bold mb-4">{recommendation.title}</h2>
            <p className="text-card-foreground/70 max-h-60 overflow-y-auto">
              {recommendation.explanation}
            </p>
          </div>
        </div>

        {/* The Close Button - Positioned relative to the new wrapper */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border text-muted-foreground/80 hover:text-muted-foreground hover:bg-muted transition-colors shadow-lg"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};