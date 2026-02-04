import type { TrainSearchResult } from "@/app/types/search.types";

export interface SearchTrainProps {
  onSelectTrain: (trainNumber: string) => void;
  defaultValue?: string;
  variant?: "fixed" | "inline";
}

export type StoredTrain = {
  number: string;
  label: string;
};

export type { TrainSearchResult };
