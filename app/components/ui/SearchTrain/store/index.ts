const SELECTED_TRAIN_KEY = 'selectedTrain';

import type { StoredTrain } from "../types/types";

export const getStoredTrain = (): StoredTrain | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SELECTED_TRAIN_KEY);
    if (!raw) return null;

    // Backward compatibility: earlier versions stored plain train number
    try {
      const parsed = JSON.parse(raw) as StoredTrain;
      if (parsed?.number && parsed?.label) return parsed;
      return null;
    } catch {
      // Not JSON, assume plain number string
      return { number: raw, label: raw };
    }
  } catch {
    return null;
  }
};

export const saveStoredTrain = (trainNumber: string, label: string) => {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredTrain = { number: trainNumber, label };
    localStorage.setItem(SELECTED_TRAIN_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors (e.g., quota)
  }
};
