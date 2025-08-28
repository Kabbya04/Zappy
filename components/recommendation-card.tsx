"use client";

import { useRef, useEffect } from 'react';

interface RecommendationCardProps {
  title: string;
  category: string;
  explanation: string;
}

export const RecommendationCard = ({ title, category, explanation }: RecommendationCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Set CSS variables for global mouse position
      card.style.setProperty('--mouse-x', `${e.clientX}px`);
      card.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    // Listen to the window's mousemove event for a global effect
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div 
      ref={cardRef}
      className="glow-card bg-card text-card-foreground p-6 rounded-2xl shadow-lg w-full border border-border"
    >
      <div className="transition-transform transform hover:scale-105">
        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {category}
        </span>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/70">{explanation}</p>
      </div>
    </div>
  );
};