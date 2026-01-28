"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "darkMode";

function getInitialDarkMode(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function useDark() {
  const [isDark, setIsDark] = useState(getInitialDarkMode);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
    const html = document.documentElement;
      
      html.classList.toggle("dark", newValue);
      localStorage.setItem(STORAGE_KEY, String(newValue));
      
      return newValue;
    });
  }, []);

  return { isDark, toggleDarkMode };
}

