import { useQuery } from "@tanstack/react-query";
import { fetchTrainData, trainQueryKeys } from "@/app/api/train.api";
import type { TrainApiResponse, ApiError } from "@/app/types/train.types";
import { DEFAULT_REFETCH_INTERVAL } from "@/app/config/circular-rotator.config";

interface UseTrainDataOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  journeyDate?: string;
}

export function useTrainData(trainNumber: string, options: UseTrainDataOptions = {}) {
  const {
    enabled = true,
    refetchInterval = DEFAULT_REFETCH_INTERVAL,
    journeyDate,
  } = options;

  return useQuery<TrainApiResponse, ApiError>({
    queryKey: trainQueryKeys.detail(trainNumber, journeyDate),
    queryFn: () => fetchTrainData(trainNumber, journeyDate),
    enabled: enabled && !!trainNumber,
    refetchInterval,
    placeholderData: (previousData) => previousData,
  });
}
