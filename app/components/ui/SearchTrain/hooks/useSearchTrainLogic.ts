import { useMemo } from "react";
import { useTrainSearch } from "@/app/providers/SearchQueryProvider";
import type { TrainSearchResult } from "../types/types";

/**
 * Fuzzy search - uses "contains" matching with hierarchy
 * Scoring: exact(1000) > startsWith(900) > wordBoundary(750) > contains(500)
 */
function fuzzyScore(text: string, query: string): number {
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact match - highest score
  if (textLower === queryLower) return 1000;

  // Starts with - very high score
  if (textLower.startsWith(queryLower)) return 900;

  // Word boundary match - high score (for train names like "Rajdhani Express")
  const words = textLower.split(/[\s\-_()]+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) return 750;
  }

  // Contains match - medium score (for partial matches like "126" in "22126")
  if (textLower.includes(queryLower)) return 500;

  return 0; // No match
}

interface UseSearchTrainLogicProps {
  query: string;
}

interface UseSearchTrainLogicReturn {
  results: TrainSearchResult[];
  isLoading: boolean;
}

/**
 * Pure business logic hook for train search
 * Handles: fuzzy scoring, filtering, sorting
 * Does NOT handle: UI state, refs, event handlers
 */
export function useSearchTrainLogic({ query }: UseSearchTrainLogicProps): UseSearchTrainLogicReturn {
  const { data: rawResults = [], isLoading } = useTrainSearch(query);

  // Apply fuzzy scoring and sorting
  const results = useMemo(() => {
    if (!query.trim()) return rawResults;

    const trimmedQuery = query.trim();

    return rawResults
      .map(train => ({
        train,
        score: Math.max(
          fuzzyScore(train.trainNumber, trimmedQuery),
          fuzzyScore(train.trainName, trimmedQuery) * 2,         // Name weighted 2x
          fuzzyScore(train.sourceStationCode, trimmedQuery),      // Source station code
          fuzzyScore(train.destinationStationCode, trimmedQuery), // Destination station code
          fuzzyScore(`${train.trainNumber} ${train.trainName}`, trimmedQuery)
        )
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.train);
  }, [rawResults, query]);

  return {
    results,
    isLoading,
  };
}
