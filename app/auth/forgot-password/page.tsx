'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
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
              <h1 className="text-3xl font-bold tracking-tight">Forgot Password?</h1>
              <p className="text-muted-foreground mt-2">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setSuccess(false);
            setIsLoading(true);
            
            try {
              await resetPassword(email);
              setSuccess(true);
            } catch (err: unknown) {
              setError(err instanceof Error ? err.message : "Failed to send reset email");
            } finally {
              setIsLoading(false);
            }
          }} className="grid gap-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm">
                Check your email for the password reset link!
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
              
              <Button type="submit" className="w-full py-6 mt-2" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
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
          <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-lg opacity-90">
            Don&apos;t worry, we&apos;ll help you regain access to your personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}