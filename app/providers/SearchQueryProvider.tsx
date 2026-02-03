import { useQuery } from "@tanstack/react-query";
import { searchTrains, searchQueryKeys } from "@/app/api/search.api";
import type { TrainSearchResponse } from "@/app/types/search.types";

interface UseTrainSearchOptions {
  enabled?: boolean;
}

export function useTrainSearch(query: string, options: UseTrainSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery<TrainSearchResponse>({
    queryKey: searchQueryKeys.trains(query),
    queryFn: () => searchTrains(query),
    enabled: enabled && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
