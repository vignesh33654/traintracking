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

interface UseTrainSearchOptions {
  enabled?: boolean;
  maxResults?: number;
}

/**
 * Filter trains based on search query
 * Searches across: train number, name, source station, destination station
 */
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

/**
 * Hook for searching trains with client-side filtering
 *
 * Performance:
 * - First load: ~500ms (fetches all trains from API)
 * - Subsequent searches: <10ms (client-side filtering)
 *
 * @param query - Search query (min 2 characters)
 * @param options - Search options
 * @returns Filtered train results and loading state
 */
export function useTrainSearch(
  query: string,
  options: UseTrainSearchOptions = {},
) {
  const { enabled = true, maxResults = 50 } = options;

  // Fetch all trains once and cache forever
  const { data: allTrains = [], isLoading } = useQuery({
    queryKey: searchQueryKeys.allTrains(),
    queryFn: fetchAllTrains,
    staleTime: Infinity, // Never refetch automatically
    gcTime: Infinity, // Keep in cache forever
  });

  // Client-side filtering (super fast: <10ms)
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
