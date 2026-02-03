import { apiClient } from '@/app/lib/api-client';
import type { TrainSearchResponse } from '@/app/types/search.types';

export async function searchTrains(query: string): Promise<TrainSearchResponse> {
  const params = new URLSearchParams({ query });
  return apiClient<TrainSearchResponse>(`/api/search/trains?${params.toString()}`);
}

export const searchQueryKeys = {
  all: ['search'] as const,
  trains: (query: string) => [...searchQueryKeys.all, 'trains', query] as const,
};
