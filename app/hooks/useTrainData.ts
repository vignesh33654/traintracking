import { useQuery } from '@tanstack/react-query';
import { fetchTrainData, trainQueryKeys } from '@/app/api/train.api';
import type { TrainApiResponse, ApiError } from '@/app/types/train.types';

interface UseTrainDataOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  journeyDate?: string;
}

export function useTrainData(
  trainNumber: string,
  options: UseTrainDataOptions = {}
) {
  const {
    enabled = true,
    refetchInterval = 60000,
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

export function formatDelay(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return 'N/A';
  if (minutes === 0) return 'On Time';
  if (minutes > 0) return `${minutes} min late`;
  return `${Math.abs(minutes)} min early`;
}

export function formatTime(minutesSinceMidnight: number | null | undefined): string {
  if (minutesSinceMidnight === null || minutesSinceMidnight === undefined) return '--:--';
  const hours = Math.floor(minutesSinceMidnight / 60);
  const minutes = minutesSinceMidnight % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

