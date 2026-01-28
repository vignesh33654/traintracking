"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "darkMode";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot() {
  return false;
}

export function useDark() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleDarkMode = useCallback(() => {
    const newValue = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", newValue);
    localStorage.setItem(STORAGE_KEY, String(newValue));
  }, []);

  return { isDark, toggleDarkMode };
}

