"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DEFAULT_THEME: Theme = "dark";

export type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Reflect the theme onto <html> so the `.dark` variant in index.css takes effect.
// `colorScheme` is what makes the browser paint ITS surfaces (scrollbars, form
// controls, and Safari's rubber-band overscroll area) dark instead of white.
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = theme;
};

// localStorage throws outright in some Safari/WKWebView configurations (private
// browsing, blocked site data). Reading and writing the theme must never be able
// to take the whole app down — a crashed tree renders as a blank white page.
const readStoredTheme = (): Theme => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Sync from localStorage on mount (server always renders the default).
  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable — the theme still applies for this session
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a <ThemeProvider>");
  return ctx;
};
