"use client";

interface RecommendationCardProps {
  title: string;
  category: string;
  explanation: string;
}

export const RecommendationCard = ({ title, category, explanation }: RecommendationCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg w-full transition-transform transform hover:scale-105">
      <span className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
        {category}
      </span>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{explanation}</p>
    </div>
  );
};