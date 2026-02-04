const SELECTED_TRAIN_KEY = 'selectedTrain';

type StoredTrain = {
  number: string;
  label: string;
};

export const getStoredTrain = (): StoredTrain | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SELECTED_TRAIN_KEY);
    if (!raw) return null;

    // Backward compatibility: earlier versions stored plain train number
    try {
      const parsed = JSON.parse(raw) as StoredTrain;
      if (parsed?.number && parsed?.label) return parsed;
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
  }
};

export function cleanTrainName(trainName: string): string {
  const wordsToRemove = [
    '\\(Day \\d+\\)',  // Remove "(Day 1)", "(Day 2)", etc.
    'SUPERFAST',
    'EXPRESS',
    'INTERCITY',
    'WEEKLY',
    'MEMU',
    'RAILWAY',
    'SPECIAL',
    'MAIL',
    'JN',
    'JN.',
    'CENTRAL',
    '\\(PT\\)',
    'M\\. G\\. R',
    'M\\.G\\.R',
  ];

  let cleaned = trainName;

  wordsToRemove.forEach(word => {
    cleaned = cleaned.replace(new RegExp(word, 'gi'), '');
  });

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\s*-\s*/g, ' to ');

  return cleaned;
}
