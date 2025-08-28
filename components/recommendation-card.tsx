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
      const { left, top } = card.getBoundingClientRect();
      const mouseX = e.clientX - left;
      const mouseY = e.clientY - top;
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);
    };
    card.addEventListener('mousemove', handleMouseMove);
    return () => card.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={cardRef}
      className="spotlight-card bg-card text-card-foreground p-6 rounded-2xl shadow-lg w-full transition-transform transform hover:scale-105 border border-border"
    >
      <div className="relative z-[1]">
        <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
          {category}
        </span>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-foreground/70">{explanation}</p>
      </div>
    </div>
  );
};