import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  fetchAllTrains,
  searchQueryKeys,
  type TrainTuple,
} from "@/app/api/search.api";
import type {
  TrainSearchResponse,
  TrainSearchResult,
} from "@/app/types/search.types";
import { REFETCH_INTERVALS } from "@/app/config/refetch.config";

interface UseTrainSearchOptions {
  enabled?: boolean;
  maxResults?: number;
}

function filterTrains(
  trains: TrainTuple[],
  query: string,
  maxResults: number,
): TrainSearchResult[] {
  const queryLower = query.toLowerCase();

  return trains
    .filter(([number, name, from, to]) => {
      return (
        number.toLowerCase().includes(queryLower) ||
        name.toLowerCase().includes(queryLower) ||
        from.toLowerCase().includes(queryLower) ||
        to.toLowerCase().includes(queryLower)
      );
    })
    .slice(0, maxResults)
    .map(([number, name, from, to]) => ({
      trainNumber: number,
      trainName: name,
      sourceStationCode: from,
      destinationStationCode: to,
    }));
}

export function useTrainSearch(
  query: string,
  options: UseTrainSearchOptions = {},
) {
  const { enabled = true, maxResults = 50 } = options;

  const { data: allTrains = [], isLoading } = useQuery({
    queryKey: searchQueryKeys.allTrains(),
    queryFn: fetchAllTrains,
    staleTime: REFETCH_INTERVALS.SEARCH_DATA,
    gcTime: REFETCH_INTERVALS.SEARCH_DATA,
  });

  const results: TrainSearchResponse = useMemo(() => {
    if (!enabled || query.length < 2) {
      return [];
    }

    return filterTrains(allTrains, query, maxResults);
  }, [allTrains, query, enabled, maxResults]);

  return {
    data: results,
    isLoading,
  };
}
