import type { TrainApiResponse } from "@/app/types/train.types";

export const REFETCH_INTERVALS = {
  RUNNING_MOVING: 30000,
  RUNNING_AT_STATION: 60000,
  NOT_STARTED: 120000,
  SEARCH_DATA: Infinity,
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 30000,
  SEARCH: 60000,
} as const;

export const CACHE_DURATIONS = {
  STALE_TIME: 30000,
  MAX_AGE: 24 * 60 * 60 * 1000,
  SEARCH_SERVER: 60 * 60 * 1000,
} as const;

export function getSmartRefetchInterval(
  data?: TrainApiResponse,
): number | false {
  if (!data?.metadata?.journeyStatus) {
    return REFETCH_INTERVALS.RUNNING_MOVING;
  }

  const journeyStatus = data.metadata.journeyStatus.status;

  if (
    journeyStatus === "COMPLETED" ||
    journeyStatus === "CANCELLED" ||
    journeyStatus === "NOT_RUNNING_ON_DATE"
  ) {
    return false;
  }

  if (journeyStatus === "NOT_STARTED") {
    return REFETCH_INTERVALS.NOT_STARTED;
  }

  if (journeyStatus === "RUNNING" && data.liveData?.currentLocation) {
    const locationStatus = data.liveData.currentLocation.status;

    if (locationStatus === "AT_STATION" || locationStatus === "ARRIVED") {
      return REFETCH_INTERVALS.RUNNING_AT_STATION;
    }

    return REFETCH_INTERVALS.RUNNING_MOVING;
  }

  return REFETCH_INTERVALS.RUNNING_MOVING;
}
