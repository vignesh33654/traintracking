"use client";

import { useEffect, useState } from "react";

export function useDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  function toggleDarkMode() {
    const html = document.documentElement;
    const willBeDark = !isDark;
    
    if (willBeDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    setIsDark(willBeDark);
    localStorage.setItem("darkMode", willBeDark ? "true" : "false");
  }

  return { isDark, toggleDarkMode };
}

