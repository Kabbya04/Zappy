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
      const { left, top } = card.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!recommendation) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        ref={cardRef}
        className="spotlight-card bg-card text-card-foreground rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full relative transform transition-all duration-300 border border-border mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground/50 hover:text-muted-foreground z-10"
        >
          <X size={24} />
        </button>
        
        <div className="relative z-[1]">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
            {recommendation.category}
          </span>
          <h2 className="text-2xl font-bold mb-4">{recommendation.title}</h2>
          <p className="text-card-foreground/70 max-h-60 overflow-y-auto">
            {recommendation.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

