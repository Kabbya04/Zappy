"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { LampContainer } from "@/components/lamp";
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function LandingPage({ 
  setShowLanding,
  isContextLoading
}: { 
  setShowLanding: (show: boolean) => void;
  isContextLoading: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isContextLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">Warming up Zappy...</p>
      </div>
    );
  }

  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-foreground to-secondary py-4 bg-clip-text text-center text-5xl font-bold tracking-tight text-transparent md:text-7xl"
      >
        Zappy ⚡
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 120 }}
        whileInView={{ opacity: 1, y: 20 }}
        transition={{
          delay: 0.4,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-4 max-w-2xl text-center text-base md:text-lg text-foreground/70"
      >
        An AI-powered recommender that uses LLMs to suggest games, anime, and movies based on your tastes. Through natural conversation, it delivers smart, personalized picks—helping you discover your next favorite game, binge-worthy anime, or movie that perfectly matches your mood.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 140 }}
        whileInView={{ opacity: 1, y: 40 }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 flex items-center space-x-4"
      >
        <button
          onClick={() => setShowLanding(false)}
          className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
        >
          Get Started
        </button>
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          className="p-3 rounded-full text-foreground/60 hover:bg-card/50"
        >
          {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
        </button>
      </motion.div>
    </LampContainer>
  );
}