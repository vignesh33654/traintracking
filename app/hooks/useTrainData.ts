import { useQuery } from "@tanstack/react-query";
import { fetchTrainData, trainQueryKeys } from "@/app/api/train.api";
import type { TrainApiResponse, ApiError } from "@/app/types/train.types";
import { getSmartRefetchInterval } from "@/app/config/refetch.config";

interface UseTrainDataOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  journeyDate?: string;
}

export function useTrainData(
  trainNumber: string,
  options: UseTrainDataOptions = {},
) {
  const {
    enabled = true,
    refetchInterval: customRefetchInterval,
    journeyDate,
  } = options;

  const query = useQuery<TrainApiResponse, ApiError>({
    queryKey: trainQueryKeys.detail(trainNumber, journeyDate),
    queryFn: () => fetchTrainData(trainNumber, journeyDate),
    enabled: enabled && !!trainNumber,
    refetchInterval: (query) => {
      if (customRefetchInterval !== undefined) {
        return customRefetchInterval;
      }
      return getSmartRefetchInterval(query.state.data);
    },
    placeholderData: (previousData) => previousData,
  });

  return query;
}
