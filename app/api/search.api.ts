import { apiClient } from "@/app/lib/api-client";
import type { TrainSearchResponse } from "@/app/types/search.types";

/**
 * Train data tuple from RailRadar API
 * [trainNumber, trainName, sourceStationCode, destinationStationCode]
 */
export type TrainTuple = [string, string, string, string];

interface AllTrainsResponse {
  success: boolean;
  data: TrainTuple[];
  cached: boolean;
  count: number;
}

/**
 * Fetch all trains data (cached on server for 1 hour)
 * Used for client-side search filtering
 */
export async function fetchAllTrains(): Promise<TrainTuple[]> {
  const response = await apiClient<AllTrainsResponse>("/api/search/all");
  return response.data;
}

/**
 * Legacy: Server-side search (deprecated - use fetchAllTrains + client-side filtering)
 */
export async function searchTrains(
  query: string,
): Promise<TrainSearchResponse> {
  const params = new URLSearchParams({ query });
  return apiClient<TrainSearchResponse>(
    `/api/search/trains?${params.toString()}`,
  );
}

/**
 * React Query cache keys
 */
export const searchQueryKeys = {
  all: ["search"] as const,
  allTrains: () => [...searchQueryKeys.all, "all-trains"] as const,
  trains: (query: string) => [...searchQueryKeys.all, "trains", query] as const,
};
