'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();

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
              <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
              <p className="text-muted-foreground mt-2">
                Enter your new password to complete the reset process
              </p>
            </div>
          </div>
          
          <div className="grid gap-6">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm">
                Password updated successfully! Redirecting to sign in...
              </div>
            )}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setSuccess(false);
              
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
                await updatePassword(password);
                setSuccess(true);
                setTimeout(() => {
                  router.push('/auth/signin');
                }, 2000);
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to update password");
              } finally {
                setIsLoading(false);
              }
            }} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-left">
                  New Password
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
                  Confirm New Password
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
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
              
              <div className="mt-4 text-center text-sm">
                <Link href="/auth/signin" className="text-primary hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
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
          <h2 className="text-4xl font-bold mb-4">Secure Your Account</h2>
          <p className="text-lg opacity-90">
            Create a strong new password to protect your personalized recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}