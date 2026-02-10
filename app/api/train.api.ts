import { apiClient } from '@/app/lib/api-client';
import type { TrainApiResponse } from '@/app/types/train.types';

const DEFAULT_JOURNEY_DATE = 'today';

function buildTrainApiUrl(trainNumber: string, journeyDate?: string): string {
  const params = new URLSearchParams({
    trainNumber,
    journeyDate: journeyDate || '',
  });
  return `/api/train?${params.toString()}`;
}

export async function fetchTrainData(
  trainNumber: string,
  journeyDate?: string
): Promise<TrainApiResponse> {
  const url = buildTrainApiUrl(trainNumber, journeyDate);
  return apiClient<TrainApiResponse>(url);
}

export async function fetchAverageDelay(trainNumber: string) {
  const params = new URLSearchParams({ trainNumber });
  return apiClient<unknown>(`/api/average-delay?${params.toString()}`);
}

export const trainQueryKeys = {
  all: ['trains'] as const,
  detail: (trainNumber: string, journeyDate?: string) =>
    [...trainQueryKeys.all, trainNumber, journeyDate || DEFAULT_JOURNEY_DATE] as const,
};

