// /components/recommendation-modal.tsx
"use client";

import { X, Film } from 'lucide-react';

// Interface for the recommendation object
interface Recommendation {
  title: string;
  category: string;
  explanation: string;
  imageUrl?: string;
}

// Interface for the component's props
interface RecommendationModalProps {
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const RecommendationModal = ({ recommendation, onClose }: RecommendationModalProps) => {
  // If no recommendation is passed, the modal doesn't render
  if (!recommendation) return null;

  return (
    // The main modal container with the backdrop
    <div 
      className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 flex justify-center items-center transition-opacity duration-300 p-4"
      onClick={onClose} // Allows closing the modal by clicking the backdrop
    >
      {/* A wrapper to prevent clicks inside the card from closing the modal */}
      <div 
        className="relative" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODIFICATION: The card content now mirrors the structure of recommendation-card.tsx */}
        <div className="flex flex-col w-full bg-card border border-border rounded-lg shadow-xl md:flex-row md:max-w-2xl">
          
          {/* Image Container */}
          <div className="relative w-full md:w-56 h-72 md:h-auto flex-shrink-0">
            {recommendation.imageUrl ? (
              <img 
                className="object-cover w-full h-full rounded-t-lg md:rounded-none md:rounded-l-lg" 
                src={recommendation.imageUrl} 
                alt={`Thumbnail for ${recommendation.title}`} 
              />
            ) : (
              // Fallback placeholder if no image is found
              <div className="flex items-center justify-center w-full h-full bg-muted/50 rounded-t-lg md:rounded-none md:rounded-l-lg">
                <Film className="w-16 h-16 text-muted-foreground/40" />
              </div>
            )}
          </div>

          {/* Text Content Container */}
          <div className="flex flex-col justify-between p-6 leading-normal">
            <div>
              <span className="inline-block bg-primary/20 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {recommendation.category}
              </span>
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-card-foreground">
                {recommendation.title}
              </h2>
            </div>
            {/* Added a max-height and scrollbar for longer explanations */}
            <p className="mb-3 font-normal text-card-foreground/70 max-h-48 overflow-y-auto">
              {recommendation.explanation}
            </p>
          </div>
        </div>

        {/* The Close Button remains positioned relative to the wrapper */}
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