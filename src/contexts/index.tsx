"use client";

import type { ReactNode } from "react";
import { AppProvider } from "./app-context";
import { QueryProvider } from "./query-context";

export type ProvidersProps = {
  children: ReactNode;
};

// Mounts every app-level provider once. Consumed by the (main) layout.
export const Providers = ({ children }: ProvidersProps) => (
  <AppProvider>
    <QueryProvider>{children}</QueryProvider>
  </AppProvider>
);

export { useApp } from "./app-context";
export { QueryProvider } from "./query-context";
