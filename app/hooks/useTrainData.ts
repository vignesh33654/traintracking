import { useQuery } from "@tanstack/react-query";
import { fetchTrainData, trainQueryKeys } from "@/app/api/train.api";
import type { TrainApiResponse, ApiError } from "@/app/types/train.types";

interface UseTrainDataOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  journeyDate?: string;
}

const DEFAULT_REFETCH_INTERVAL = 60000; // 1 minute

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
