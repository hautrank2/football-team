"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

// App-wide, non-server state. Server state belongs in TanStack Query, not here.
// Extend this shape as the app grows (current user, theme, feature flags, ...).
export type AppContextValue = {
  appName: string;
};

const AppContext = createContext<AppContextValue | null>(null);

export type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const value = useMemo<AppContextValue>(() => ({ appName: "App" }), []);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an <AppProvider>");
  return ctx;
};
