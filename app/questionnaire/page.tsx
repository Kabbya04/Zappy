"use client";

import { initialQuestion, questionSets } from '@/lib/questions';
import { CornerDownLeft } from 'lucide-react';
import { useState } from 'react';

interface QuestionnairePageProps {
  selectedCategory: string | null;
  currentQuestionIndex: number;
  isOtherSelected: boolean;
  otherAnswerText: string;
  setIsOtherSelected: (value: boolean) => void;
  setOtherAnswerText: (value: string) => void;
  handleAnswer: (answer: string) => void;
  handleOtherSubmit: () => void;
}

export default function QuestionnairePage({
  selectedCategory,
  currentQuestionIndex,
  isOtherSelected,
  otherAnswerText,
  setIsOtherSelected,
  setOtherAnswerText,
  handleAnswer,
  handleOtherSubmit
}: QuestionnairePageProps) {
  const currentQ = !selectedCategory ? initialQuestion : questionSets[selectedCategory as keyof typeof questionSets][currentQuestionIndex];
  const progressText = selectedCategory ? `Question ${currentQuestionIndex + 2} of 5` : "Question 1 of 5";
  const optionsLayout = !selectedCategory ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-2xl border border-border">
          <h2 className="text-2xl font-bold text-center mb-6">{currentQ.text}</h2>
          {isOtherSelected ? (
            <div className="flex flex-col gap-4">
              <input 
                type="text" 
                value={otherAnswerText} 
                onChange={(e) => setOtherAnswerText(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleOtherSubmit()} 
                placeholder="Type your answer here..." 
                className="w-full p-4 rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" 
                autoFocus 
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleOtherSubmit} 
                  className="flex-grow p-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  Submit
                </button>
                <button 
                  onClick={() => setIsOtherSelected(false)} 
                  className="p-4 rounded-xl bg-muted text-foreground hover:bg-muted/70 transition-colors" 
                  title="Go back to options"
                >
                  <CornerDownLeft size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div className={optionsLayout}>
              {currentQ.options.map((option) => (
                <button 
                  key={option} 
                  onClick={() => handleAnswer(option)} 
                  className="p-4 rounded-xl text-lg bg-background border border-border text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                >
                  {option}
                </button>
              ))}
              {selectedCategory && (
                <button 
                  key="other" 
                  onClick={() => setIsOtherSelected(true)} 
                  className="p-4 rounded-xl text-lg bg-background border border-border text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                >
                  Other
                </button>
              )}
            </div>
          )}
          <div className="mt-6 text-center text-sm text-muted-foreground">{progressText}</div>
        </div>
      </div>
    </div>
  );
}