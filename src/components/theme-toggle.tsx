"use client";

import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
