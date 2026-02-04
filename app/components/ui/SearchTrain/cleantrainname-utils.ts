const SELECTED_TRAIN_KEY = 'selectedTrain';

export const getStoredTrain = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(SELECTED_TRAIN_KEY);
  } catch {
    return null;
  }
};

export const saveStoredTrain = (trainNumber: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SELECTED_TRAIN_KEY, trainNumber);
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

