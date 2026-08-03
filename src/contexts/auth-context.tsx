"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEYS } from "@/constants";
import type { AuthUserModel } from "@/types";

// Minimal client-side auth. NOTE: no server session/JWT yet — the current user
// is kept in localStorage only. Replace with httpOnly-cookie sessions later.
export type AuthContextValue = {
  user: AuthUserModel | null;
  isReady: boolean; // localStorage has been read
  login: (user: AuthUserModel) => void;
  update: (patch: Partial<AuthUserModel>) => void; // merge fields into the current user
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUserModel | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setIsReady(true);
  }, []);

  const login = useCallback((next: AuthUserModel) => {
    setUser(next);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(next));
  }, []);

  const update = useCallback((patch: Partial<AuthUserModel>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }, []);

  const value = useMemo(
    () => ({ user, isReady, login, update, logout }),
    [user, isReady, login, update, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
};
