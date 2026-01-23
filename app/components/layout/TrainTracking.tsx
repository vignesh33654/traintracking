"use client";

import { useMemo } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { API_CONFIG } from "@/app/config/api.config";
import { useTrainData } from "@/app/hooks/useTrainData";
import CircularRotator from "@/app/components/ui/CircularRotator/CircularRotator";
import {
  TrackingEmptyState,
  TrackingErrorState,
  TrackingLoadingState,
} from "@/app/components/layout/TrackingStates";

const TRAIN_NUMBER = API_CONFIG.trainNumber;

export default function TrainTracking() {
  const { data, isLoading, isError, error, refetch } = useTrainData(TRAIN_NUMBER);
  const isRestoring = useIsRestoring();

  const stations = useMemo(
    () => (data?.route ?? []).filter((station) => station.isHalt > 0),
    [data?.route]
  );

  if (isRestoring && !data) {
    return null;
  }

  if (isLoading && !data) {
    return <TrackingLoadingState />;
  }

  if (isError && !data) {
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

  return <CircularRotator stations={stations} liveData={data?.liveData ?? null} journeyStatus={data?.metadata?.journeyStatus ?? null}  />;
}
