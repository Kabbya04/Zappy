'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
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
              <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
              <p className="text-muted-foreground mt-2">
                Enter your information to get personalized recommendations
              </p>
            </div>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            
            if (password !== confirmPassword) {
              setError("Passwords do not match");
              return;
            }
            
            if (password.length < 6) {
              setError("Password must be at least 6 characters");
              return;
            }
            
            setIsLoading(true);
            
            try {
              await signUp(email, password, fullName);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to sign up");
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
                <Label htmlFor="name" className="text-left">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="py-5 px-4"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              
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
                <Label htmlFor="password" className="text-left">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="py-5 px-4"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirm-password" className="text-left">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  className="py-5 px-4"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full py-6 mt-2" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
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
              
              <Button variant="outline" className="w-full py-6">
                Sign up with Google
              </Button>
            </div>
            
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline">
                Sign in
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
          <h2 className="text-4xl font-bold mb-4">Join the Zappy Community</h2>
          <p className="text-lg opacity-90">
            Create an account to get personalized recommendations for games, anime, TV series, and movies.
          </p>
        </div>
      </div>
    </div>
  );
}