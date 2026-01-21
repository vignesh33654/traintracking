"use client";

import { useMemo } from "react";
import { API_CONFIG } from "@/app/config/api.config";
import { useTrainData } from "@/app/hooks/useTrainData";
import CircularRotator from "@/app/components/ui/CircularRotator/CircularRotator";
import {
  TrackingEmptyState,
  TrackingErrorState,
  TrackingLoadingState,
} from "@/app/components/ui/tracking/TrackingStates";

const TRAIN_NUMBER = API_CONFIG.trainNumber;

export default function TrainTracking() {
  const { data, isLoading, isError, error, refetch } = useTrainData(TRAIN_NUMBER);

  const stations = useMemo(
    () => (data?.route ?? []).filter((station) => station.isHalt > 0),
    [data?.route]
  );

  if (isLoading) {
    return <TrackingLoadingState />;
  }

  if (isError) {
    return (
      <TrackingErrorState
        message={error?.message || "Error loading train data"}
        onRetry={refetch}
      />
    );
  }

  if (stations.length === 0) {
    return <TrackingEmptyState />;
  }

  return <CircularRotator stations={stations} liveData={data?.liveData ?? null} />;
}
