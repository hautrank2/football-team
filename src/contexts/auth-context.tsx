"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// Minimal client-side auth. NOTE: no server session/JWT yet — the current user
// is kept in localStorage only. Replace with httpOnly-cookie sessions later.
export type AuthUser = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean; // localStorage has been read
  login: (user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = "auth_user";
const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setIsReady(true);
  }, []);

  const login = useCallback((next: AuthUser) => {
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({ user, isReady, login, logout }), [user, isReady, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
};
