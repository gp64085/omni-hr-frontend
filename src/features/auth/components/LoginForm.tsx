"use client";

import { Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isLoading,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={Mail}
        placeholder="you@company.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={Lock}
        placeholder="••••••••••••"
        required
      />

      <Button type="submit" variant="gradient" isLoading={isLoading} className="w-full mt-2">
        Sign In to Workspace
        <ArrowRight className="w-4 h-4" />
      </Button>
    </form>
  );
}
