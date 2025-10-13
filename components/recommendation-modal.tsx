// /components/recommendation-modal.tsx
"use client";

import { X } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface Recommendation {
  title: string;
  category: string;
  explanation: string;
  imageUrl?: string;
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
      cardRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
      cardRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
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
      <div 
        className="relative" 
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          ref={cardRef}
          style={{ backgroundImage: `url(${recommendation.imageUrl})` }}
          className="glow-card relative bg-card text-card-foreground rounded-2xl shadow-2xl max-w-lg w-full border border-border bg-cover bg-center"
        >
          <div className="absolute inset-0 bg-black/70 rounded-2xl"></div>
          <div className="p-6 md:p-8 relative z-[1]">
            <span className="inline-block bg-primary/20 text-primary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
              {recommendation.category}
            </span>
            <h2 className="text-2xl font-bold mb-4 text-white">{recommendation.title}</h2>
            <p className="text-white/80 max-h-60 overflow-y-auto">
              {recommendation.explanation}
            </p>
          </div>
        </div>
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