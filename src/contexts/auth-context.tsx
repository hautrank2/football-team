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
  isAdmin: boolean; // centralized role check — reuse instead of comparing role inline
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

  // Writes are wrapped: localStorage throws in some Safari/WKWebView setups
  // (private browsing, blocked site data) and an uncaught throw here would take
  // the tree down mid-render.
  const login = useCallback((next: AuthUserModel) => {
    setUser(next);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(next));
    } catch {
      // storage unavailable — session stays in memory only
    }
  }, []);

  const update = useCallback((patch: Partial<AuthUserModel>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(next));
      } catch {
        // storage unavailable — session stays in memory only
      }
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      // storage unavailable — nothing to clear
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const value = useMemo(
    () => ({ user, isReady, isAdmin, login, update, logout }),
    [user, isReady, isAdmin, login, update, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
};
