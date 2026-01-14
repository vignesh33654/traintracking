import { apiClient } from '@/app/lib/api-client';
import type { TrainApiResponse } from '@/app/types/train.types';

function getLocalApiUrl(trainNumber: string, journeyDate?: string): string {
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
  const url = getLocalApiUrl(trainNumber, journeyDate);
  const data = await apiClient<TrainApiResponse>(url);
  return data;
}

export const trainQueryKeys = {
  all: ['trains'] as const,
  detail: (trainNumber: string, journeyDate?: string) =>
    [...trainQueryKeys.all, trainNumber, journeyDate || 'today'] as const,
};

