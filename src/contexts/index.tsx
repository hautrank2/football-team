"use client";

import type { ReactNode } from "react";
import { AppProvider } from "./app-context";
import { AuthProvider } from "./auth-context";
import { QueryProvider } from "./query-context";
import { ThemeProvider } from "./theme-context";
import { TooltipProvider } from "@/components/ui/tooltip";

export type ProvidersProps = {
  children: ReactNode;
};

// Mounts every app-level provider once. Mounted in the root layout.
export const Providers = ({ children }: ProvidersProps) => (
  <ThemeProvider>
    <AppProvider>
      <AuthProvider>
        <QueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </QueryProvider>
      </AuthProvider>
    </AppProvider>
  </ThemeProvider>
);

export { useApp } from "./app-context";
export { useAuth } from "./auth-context";
export { QueryProvider } from "./query-context";
export { useTheme } from "./theme-context";
