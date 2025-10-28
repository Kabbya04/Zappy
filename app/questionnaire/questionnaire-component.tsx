// app/questionnaire/page.tsx

"use client";

import { Moon, Sun, User, Zap, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { questionSets, initialQuestion } from '@/lib/questions';

// Define new props interface
interface QuestionnairePageProps {
  selectedCategory: keyof typeof questionSets | null;
  currentQuestionIndex: number;
  tempAnswer: string | null;
  otherAnswerText: string;
  setOtherAnswerText: (value: string) => void;
  handleOptionSelect: (option: string) => void;
  handleBack: () => void;
  handleNext: () => void;
  handleStartOver: () => void;
  totalQuestions: number;
}

export default function QuestionnairePage({
  selectedCategory,
  currentQuestionIndex,
  tempAnswer,
  otherAnswerText,
  setOtherAnswerText,
  handleOptionSelect,
  handleBack,
  handleNext,
  handleStartOver,
  totalQuestions,
}: QuestionnairePageProps) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentQ = !selectedCategory ? initialQuestion : questionSets[selectedCategory][currentQuestionIndex];
  const step = selectedCategory ? currentQuestionIndex + 2 : 1;
  const progress = (step / totalQuestions) * 100;

  const isNextDisabled = !tempAnswer || (tempAnswer === 'Other' && !otherAnswerText.trim());

  const categoryTitle = selectedCategory ? selectedCategory.replace(/([A-Z])/g, ' $1').trim() : "Entertainment";

  return (
    <div className="flex flex-col w-full max-w-4xl min-h-screen mx-auto p-4 md:p-8 text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between w-full mb-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleStartOver}>
          <Zap className="text-primary" />
          <span className="text-2xl font-bold">Zappy</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full text-foreground/60 hover:bg-card/50"
            aria-label="Toggle theme"
          >
            {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
          </button>
          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border">
            <User size={18} className="text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {categoryTitle} Preferences
          </h1>
          <p className="text-muted-foreground mb-8">
            Help us understand what you like to play.
          </p>

          {/* Progress Bar */}
          <div className="mb-4 px-4 md:px-0">
            <span className="text-sm text-muted-foreground">Step {step} of {totalQuestions}</span>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Box */}
          <div className="bg-card/30 border border-border rounded-2xl p-6 md:p-8 shadow-lg w-full mt-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-6">{currentQ.text}</h2>
            <div className={`grid gap-4 ${currentQ.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'}`}>
              {currentQ.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleOptionSelect(option)}
                  className={`p-4 rounded-xl text-left border-2 transition-all duration-200 font-medium ${
                    tempAnswer === option
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  {option}
                </button>
              ))}
              {selectedCategory && (
                 <button
                  key="other"
                  onClick={() => handleOptionSelect('Other')}
                  className={`p-4 rounded-xl text-left border-2 transition-all duration-200 font-medium ${
                    tempAnswer === 'Other'
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-border bg-background hover:border-primary/50 text-foreground/80'
                  }`}
                >
                  Other
                </button>
              )}
            </div>
            {tempAnswer === 'Other' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={otherAnswerText}
                  onChange={(e) => setOtherAnswerText(e.target.value)}
                  placeholder="Please specify..."
                  className="w-full p-4 rounded-xl bg-background border-2 border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center justify-between w-full mt-8">
            <button
              onClick={handleBack}
              className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              disabled={!selectedCategory}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex justify-center py-4">
         <button onClick={handleStartOver} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw size={16} />
            <span>Restart</span>
         </button>
      </footer>
    </div>
  );
}