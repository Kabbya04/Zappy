'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-md gap-8">
          <div className="grid gap-6 text-center">
            <div className="flex justify-center">
              <div className="bg-primary rounded-full p-4">
                <Zap className="text-white w-8 h-8" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome to Zappy</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to discover personalized game, anime, TV series, and movie recommendations
              </p>
            </div>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setIsLoading(true);
            
            try {
              await signIn(email, password);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to sign in");
            } finally {
              setIsLoading(false);
            }
          }} className="grid gap-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-left">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="py-5 px-4"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    className="py-5 px-4 pr-12" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember-me" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me">Remember me</Label>
                </div>
              </div>
              
              <Button type="submit" className="w-full py-6 mt-2" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button variant="outline" className="w-full py-6" asChild>
                <Link href="/auth/signup">
                  Sign up
                </Link>
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <Link href="/recommendations" className="text-primary hover:underline">
                Continue as guest
              </Link>
            </div>
          </form>
        </div>
      </div>
      
      <div className="hidden lg:block relative">
        <Image
          src="/hero.png"
          alt="Zappy Hero"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-background/30" />
        <div className="absolute bottom-12 left-12 max-w-md text-white">
          <h2 className="text-4xl font-bold mb-4">Discover Your Next Favorite</h2>
          <p className="text-lg opacity-90">
            Get personalized recommendations for games, anime, TV series, and movies based on your preferences.
          </p>
        </div>
      </div>
    </div>
  );
}