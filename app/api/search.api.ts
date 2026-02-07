import { apiClient } from "@/app/lib/api-client";

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

export const searchQueryKeys = {
  all: ["search"] as const,
  allTrains: () => [...searchQueryKeys.all, "all-trains"] as const,
};
