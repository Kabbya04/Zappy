"use client";

import { X } from 'lucide-react';

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
  if (!recommendation) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={24} />
        </button>
        <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
          {recommendation.category}
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{recommendation.title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{recommendation.explanation}</p>
      </div>
    </div>
  );
};