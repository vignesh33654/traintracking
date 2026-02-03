"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { API_CONFIG } from "@/app/config/api.config";
import { useTrainData } from "@/app/hooks/useTrainData";
import { getTodayDate } from "@/app/utils/todaydate";
import CircularRotator from "@/app/components/ui/CircularRotator/CircularRotator";
import LoadingState from "@/app/components/layout/LoadingState";
import EmptyState from "@/app/components/layout/EmptyState";
import ErrorState from "@/app/components/layout/ErrorState";
import { StatusCard } from "../ui/FooterDottedCard";
import SearchTrain from "@/app/components/ui/SearchTrain";
import MobileHeader from "@/app/components/ui/MobileHeader";
import { getStoredTrain } from "@/app/components/ui/SearchTrain/cleantrainname-utils";

const JOURNEY_DATE = getTodayDate();

export default function Home() {
  const [selectedTrain, setSelectedTrain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getStoredTrain() || API_CONFIG.trainNumber;
    }
    return API_CONFIG.trainNumber;
  });

  // Sync with localStorage on mount (handles SSR hydration)
  useEffect(() => {
    const stored = getStoredTrain();
    if (stored && stored !== selectedTrain) {
      setSelectedTrain(stored);
    }
  }, []);

  const handleTrainSelect = useCallback((trainNumber: string) => {
    setSelectedTrain(trainNumber);
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useTrainData(
    selectedTrain,
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

  // Show loading state (but keep search visible)
  if (isLoading && !data) {
    return (
      <>
        <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="fixed" />
        <MobileHeader>
          <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="inline" />
        </MobileHeader>
        <LoadingState />
      </>
    );
  }

  // Show error state (but keep search visible)
  if (isError && !data) {
    return (
      <>
        <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="fixed" />
        <MobileHeader>
          <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="inline" />
        </MobileHeader>
        <ErrorState
          message={error?.message || "Error loading train data"}
          onRetry={refetch}
        />
      </>
    );
  }

  // Show empty state (but keep search visible)
  if (stations.length === 0) {
    return (
      <>
        <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="fixed" />
        <MobileHeader>
          <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="inline" />
        </MobileHeader>
        <EmptyState />
      </>
    );
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
    <>
      {/* Desktop: Fixed search */}
      <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="fixed" />

      {/* Mobile: Header with search and dark mode toggle */}
      <MobileHeader>
        <SearchTrain onSelectTrain={handleTrainSelect} defaultValue={selectedTrain} variant="inline" />
      </MobileHeader>

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

      <StatusCard train={data?.train ?? null} />
    </>
  );
}
