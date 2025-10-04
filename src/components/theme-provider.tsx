"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_STORAGE_KEY = "sredstva-theme";

type Theme = "light" | "dark";
type ThemeSetting = Theme | "system";

type ThemeContextValue = {
  theme: ThemeSetting;
  resolvedTheme: Theme;
  setTheme: (theme: ThemeSetting) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeSetting | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedValue === "light" || storedValue === "dark" || storedValue === "system") {
    return storedValue;
  }

  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return getStoredTheme() ?? "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() =>
    themeSetting === "system" ? getSystemTheme() : themeSetting
  );

  useEffect(() => {
    const storedTheme = getStoredTheme();
    const nextSetting = storedTheme ?? "system";

    setThemeSetting(nextSetting);
    setResolvedTheme(nextSetting === "system" ? getSystemTheme() : nextSetting);
  }, []);

  useEffect(() => {
    const nextResolvedTheme = themeSetting === "system" ? getSystemTheme() : themeSetting;

    setResolvedTheme(nextResolvedTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, themeSetting);
    }
  }, [themeSetting]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined" || themeSetting !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (event: MediaQueryListEvent) => {
      setResolvedTheme(event.matches ? "dark" : "light");
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [themeSetting]);

  const setTheme = useCallback((nextTheme: ThemeSetting) => {
    setThemeSetting(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeSetting((previousSetting) => {
      const currentResolved = previousSetting === "system" ? resolvedTheme : previousSetting;
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme: themeSetting,
      resolvedTheme,
      setTheme,
      toggleTheme,
    };
  }, [resolvedTheme, setTheme, themeSetting, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
