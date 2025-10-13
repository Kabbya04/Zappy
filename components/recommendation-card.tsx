// /components/recommendation-card.tsx
"use client";

import { useRef, useEffect } from 'react';

interface RecommendationCardProps {
  title: string;
  category: string;
  explanation: string;
  imageUrl?: string;
}

export const RecommendationCard = ({ title, category, explanation, imageUrl }: RecommendationCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      card.style.setProperty('--mouse-x', `${e.clientX}px`);
      card.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      style={{ backgroundImage: `url(${imageUrl})` }}
      className="glow-card relative bg-card text-card-foreground p-6 rounded-2xl shadow-lg w-full border border-border bg-cover bg-center"
    >
      <div className="absolute inset-0 bg-black/60 rounded-2xl"></div>
      <div className="relative z-10 transition-transform transform hover:scale-105">
        <span className="inline-block bg-primary/20 text-primary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {category}
        </span>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-white/80">{explanation}</p>
      </div>
    </div>
  );
};