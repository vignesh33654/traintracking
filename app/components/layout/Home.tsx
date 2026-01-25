"use client";

import { useMemo, useCallback } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { API_CONFIG } from "@/app/config/api.config";
import { useTrainData } from "@/app/hooks/useTrainData";
import CircularRotator from "@/app/components/ui/CircularRotator/CircularRotator";
import LoadingState from "@/app/components/layout/LoadingState";
import EmptyState from "@/app/components/layout/EmptyState";
import ErrorState from "@/app/components/layout/ErrorState";

const TRAIN_NUMBER = API_CONFIG.trainNumber;

// Set journey date here:
// - undefined = API decides (default behavior)
// - "2026-01-24" = specific date (today)
// - "2026-01-25" = tomorrow
// - "2026-01-26" = day after tomorrow
const JOURNEY_DATE = undefined;

export default function Home() {
  const { data, isLoading, isError, error, refetch, isFetching } = useTrainData(
    TRAIN_NUMBER,
    { journeyDate: JOURNEY_DATE }
  );

  const isRestoring = useIsRestoring();

  const stations = useMemo(
    () => (data?.route ?? []).filter((station) => station.isHalt > 0),
    [data?.route]
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Show nothing while restoring
  if (isRestoring && !data) {
    return null;
  }

  // Show loading state
  if (isLoading && !data) {
    return <LoadingState />;
  }

  // Show error state
  if (isError && !data) {
    return (
      <ErrorState
        message={error?.message || "Error loading train data"}
        onRetry={refetch}
      />
    );
  }

  // Show empty state
  if (stations.length === 0) {
    return <EmptyState />;
  }

  // Extract live train data
  const journeyDate = data?.liveData?.journeyDate ?? null;
  const distanceFromOriginKm = data?.liveData?.currentLocation?.distanceFromOriginKm ?? null;
  const currentLocationStatus = data?.liveData?.currentLocation?.status ?? null;
  const currentStationSequence = data?.liveData?.currentLocation?.sequence ?? null;
  const distanceFromLastStationKm = data?.liveData?.currentLocation?.distanceFromLastStationKm ?? null;
  const currentStationCode = data?.liveData?.currentLocation?.stationCode ?? null;
  const lastUpdatedAt = data?.liveData?.lastUpdatedAt ?? null;
  const destinationStationCode = data?.train?.destinationStationCode;

  // Main content
  return (
    <CircularRotator
      stations={stations}
      journeyDate={journeyDate}
      distanceFromOriginKm={distanceFromOriginKm}
      currentLocationStatus={currentLocationStatus}
      currentStationSequence={currentStationSequence}
      distanceFromLastStationKm={distanceFromLastStationKm}
      currentStationCode={currentStationCode}
      lastUpdatedAt={lastUpdatedAt}
      destinationStationCode={destinationStationCode}
      route={data?.route}
      onRefresh={handleRefresh}
      isRefreshing={isFetching}
    />
  );
}
