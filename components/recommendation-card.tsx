// components/recommendation-card.tsx

"use client";

import { Film } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';

interface RecommendationCardProps {
  title: string;
  category: string;
  explanation: string;
  imageUrl?: string;
}

export const RecommendationCard = ({ title, category, explanation, imageUrl }: RecommendationCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  const isValidImageUrl = imageUrl && !imageError;

  return (
    <div className="bg-card/50 border border-border rounded-2xl shadow-lg overflow-hidden flex flex-col group transition-transform duration-300 hover:scale-105 hover:shadow-primary/20 hover:shadow-2xl">
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] bg-muted/30">
        {isValidImageUrl ? (
          <>
            <Image 
              src={imageUrl} 
              alt={`Poster for ${title}`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoadingComplete={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-primary/50"></div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Film className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        {/* Category Tag */}
        <div className="absolute top-3 right-3 bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
          {category}
        </div>
      </div>

      {/* Text Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-serif font-bold mb-2 text-foreground">
          {title}
        </h3>
        <p className="text-card-foreground/70 text-sm leading-relaxed">
          {explanation}
        </p>
      </div>
    </div>
  );
};