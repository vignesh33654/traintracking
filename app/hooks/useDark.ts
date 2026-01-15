"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "darkMode";

export function useDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

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

