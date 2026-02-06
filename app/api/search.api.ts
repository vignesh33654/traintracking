import { apiClient } from "@/app/lib/api-client";
import type { TrainSearchResponse } from "@/app/types/search.types";

export type TrainTuple = [string, string, string, string];

interface AllTrainsResponse {
  success: boolean;
  data: TrainTuple[];
  cached: boolean;
  count: number;
}

export async function fetchAllTrains(): Promise<TrainTuple[]> {
  const response = await apiClient<AllTrainsResponse>("/api/search/all");
  return response.data;
}

export async function searchTrains(
  query: string,
): Promise<TrainSearchResponse> {
  const params = new URLSearchParams({ query });
  return apiClient<TrainSearchResponse>(
    `/api/search/trains?${params.toString()}`,
  );
}

export const searchQueryKeys = {
  all: ["search"] as const,
  allTrains: () => [...searchQueryKeys.all, "all-trains"] as const,
  trains: (query: string) =>
    [...searchQueryKeys.all, "trains", query] as const,
};
