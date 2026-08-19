"use client";

import { ReactNode, useState } from "react";
import { useAuthStore } from "@/store/use-auth-store";
import { UserProfile } from "@/types/user";

interface AuthProviderProps {
  children: ReactNode;
  initialUser: UserProfile | null;
  initialToken?: string | null;
}

export function AuthProvider({ children, initialUser, initialToken }: AuthProviderProps) {
  useState(() => {
    useAuthStore.getState().initializeSession(initialUser, initialToken);
    return true;
  });

  return <>{children}</>;
}
