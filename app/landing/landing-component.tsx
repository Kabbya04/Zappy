"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { LampContainer } from "@/components/lamp";
import { useTheme } from 'next-themes';
import { Sun, Moon, Zap, Gamepad2, Bot, Film, Tv2, ChevronDown, ChevronsDown, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { User as SupabaseUser } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export default function LandingPage({ 
  setShowLanding,
  isContextLoading
}: { 
  setShowLanding: (show: boolean) => void;
  isContextLoading: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const { getUser, signOut } = useAuth();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchUser = async () => {
      try {
        const loggedInUser = await getUser();
        setUser(loggedInUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [getUser]);

  const handleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleGuestMode = () => {
    setIsGuest(true);
    setShowLanding(false);
  };

  const featureCards = [
    {
      icon: Gamepad2,
      title: 'Games',
      description: 'From indie hits to AAA titles, find your next adventure.'
    },
    {
      icon: Bot,
      title: 'Anime',
      description: 'Explore vast worlds, from classic shonen to the latest releases.'
    },
    {
      icon: Film,
      title: 'Movies',
      description: 'Discover critically acclaimed films and blockbuster hits.'
    },
    {
      icon: Tv2,
      title: 'TV Series',
      description: 'Binge-worthy series and episodic masterpieces await.'
    }
  ];

  const accordionItems = [
    {
      title: 'Personalized Recommendations',
      content: 'Tell Zappy what you love, and get tailored suggestions for new titles you’re sure to enjoy. Our AI learns from your preferences to deliver truly personal picks.'
    },
    {
      title: 'Deep Dives & Trivia',
      content: 'Go beyond the surface. Ask Zappy for behind-the-scenes facts, plot summaries, or trivia about your favorite titles and get instant, detailed answers.'
    },
    {
      title: 'Engaging Discussions',
      content: 'Use the conversational chat to discuss recommendations, refine your choices, or explore new genres. Zappy is ready to talk about all things entertainment.'
    }
  ];

  if (isContextLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        <p className="mt-4 text-lg text-muted-foreground">Warming up Zappy...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
              <Zap className="text-primary" />
              <span className="text-xl font-bold">Zappy</span>
            </div>
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">About</a>
              </nav>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full text-foreground/60 hover:bg-card/50"
                aria-label="Toggle theme"
              >
                {isMounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
              </button>
              {user || isGuest ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-full text-foreground/60 hover:bg-card/50">
                      <User size={20} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>{isGuest ? 'Guest' : user?.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {!isGuest && <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="hidden sm:block bg-secondary text-secondary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Sign in / Sign up
                </button>
              )}
              <button
                onClick={() => setShowLanding(false)}
                className="hidden sm:block bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Zappy Now
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
                className="mt-8 bg-gradient-to-br from-foreground to-secondary py-4 bg-clip-text text-center text-4xl md:text-6xl font-bold tracking-tight text-transparent"
            >
                Meet Zappy
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 120 }}
                whileInView={{ opacity: 1, y: 20 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
                className="mt-4 max-w-2xl text-center text-base md:text-lg text-foreground/70"
            >
                Your intelligent assistant for discovering and discussing your favorite games, anime, movies, and TV series.
            </motion.p>
            
            <motion.div
                initial={{ opacity: 0, y: 140 }}
                whileInView={{ opacity: 1, y: 40 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                className="flex flex-col items-center"
            >
                <div className="flex gap-4">
                  <button
                      onClick={() => setShowLanding(false)}
                      className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
                  >
                      Start Exploring
                  </button>
                  {!user && (
                    <button
                        onClick={handleGuestMode}
                        className="bg-secondary text-secondary-foreground font-bold py-3 px-8 rounded-full hover:bg-secondary/90 transition-transform transform hover:scale-105"
                    >
                        Continue as Guest
                    </button>
                  )}
                </div>

                <motion.a
                  href="#guide"
                  className="mt-20 cursor-pointer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1.5 }}
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  >
                    <ChevronsDown className="w-8 h-8 text-muted-foreground" />
                  </motion.div>
                </motion.a>
            </motion.div>
        </LampContainer>
        
        <div id="guide" className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20 md:py-32 space-y-24 md:space-y-32">
            {/* Guide Section */}
            <section className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Guide to Entertainment</h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
                    Zappy provides personalized recommendations and fosters engaging discussions across a wide range of entertainment domains. Discover hidden gems, explore detailed trivia, and connect with a community of fans.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featureCards.map((card, index) => (
                        <div key={index} className="bg-card/50 border border-border rounded-xl p-6 flex flex-col items-center text-center glow-card">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <card.icon className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>
                <div className="max-w-3xl mx-auto space-y-4">
                    {accordionItems.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg bg-card/50 overflow-hidden">
                            <button
                                onClick={() => handleAccordion(index)}
                                className="w-full flex justify-between items-center p-5 text-left font-semibold"
                            >
                                <span>{item.title}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openAccordion === index ? 'rotate-180' : ''}`} />
                            </button>
                            <div
                                className={`grid transition-all duration-500 ease-in-out ${openAccordion === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                            >
                                <div className="overflow-hidden">
                                  <p className="text-muted-foreground text-left p-5 pt-0">{item.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-card/50 border border-border rounded-2xl p-10 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to dive in?</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                    Your next favorite discovery is just a conversation away. Start exploring with Zappy and unlock a world of entertainment tailored just for you.
                </p>
                <button
                    onClick={() => setShowLanding(false)}
                    className="bg-primary text-primary-foreground font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-transform transform hover:scale-105"
                >
                    Start Exploring with Zappy
                </button>
            </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between text-sm text-muted-foreground">
            <p className="flex items-center gap-2 mb-4 sm:mb-0">
                <Zap size={16} /> © {new Date().getFullYear()} Zappy. All rights reserved.
            </p>
            <div className="flex gap-6">
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            </div>
        </div>
      </footer>
    </div>
  );
}