// /components/recommendation-card.tsx
"use client";

import { Film } from 'lucide-react'; // Using an icon for the placeholder
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
  
  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    // The main container, adapting the reference style to our theme
    <div className="flex flex-col items-center bg-card border border-border rounded-lg shadow-sm md:flex-row md:max-w-xl hover:bg-muted/40 transition-colors duration-200">
      
      {/* Image Container */}
      <div className="relative w-full md:w-48 h-64 md:h-auto flex-shrink-0">
        {imageUrl && !imageError ? (
          <Image 
            className="object-cover rounded-t-lg md:rounded-none md:rounded-l-lg" 
            src={imageUrl} 
            alt={`Thumbnail for ${title}`} 
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.log(`Failed to load image: ${imageUrl}`);
              console.log('Error details:', e);
              setImageError(true);
            }}
            onLoad={() => {
              console.log(`Successfully loaded image: ${imageUrl}`);
            }}
          />
        ) : (
          // Fallback placeholder if no image is found
          <div className="flex items-center justify-center w-full h-full bg-muted/50 rounded-t-lg md:rounded-none md:rounded-l-lg">
            <Film className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Text Content Container */}
      <div className="flex flex-col justify-between p-4 leading-normal">
        <div>
          <span className="inline-block bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
            {category}
          </span>
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-card-foreground">
            {title}
          </h5>
        </div>
        <p className="mb-3 font-normal text-card-foreground/70">
          {explanation}
        </p>
      </div>
    </div>
  );
};