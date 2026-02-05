"use client";

import { useMemo, useCallback, useState } from "react";
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
import JourneyDateDropdown from "@/app/components/ui/JourneyDateDropdown";
import { getStoredTrain } from "@/app/components/ui/SearchTrain/store";

export default function Home() {
  const [journeyDate, setJourneyDate] = useState<string>(() => getTodayDate());
  const [selectedTrain, setSelectedTrain] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = getStoredTrain();
      return stored?.number || API_CONFIG.trainNumber;
    }
    return API_CONFIG.trainNumber;
  });

  const storedTrainLabel =
    typeof window !== "undefined" ? getStoredTrain()?.label : undefined;

  const handleTrainSelect = useCallback((trainNumber: string) => {
    setSelectedTrain(trainNumber);
  }, []);

  const handleJourneyDateChange = useCallback((date: string) => {
    setJourneyDate(date);
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useTrainData(
    selectedTrain,
    { journeyDate },
  );

  const isRestoring = useIsRestoring();

  const stations = useMemo(
    () =>
      (data?.route ?? []).filter(
        (station) =>
          station.isHalt > 0 &&
          typeof station.distanceFromSourceKm === "number",
      ),
    [data?.route],
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (isRestoring && !data) {
    return null;
  }

  if (isLoading && !data) {
    return (
      <>
        <JourneyDateDropdown
          value={journeyDate}
          onChange={handleJourneyDateChange}
          variant="fixed"
        />
        <SearchTrain
          onSelectTrain={handleTrainSelect}
          defaultValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <JourneyDateDropdown
            value={journeyDate}
            onChange={handleJourneyDateChange}
            variant="inline"
          />
          <SearchTrain
            onSelectTrain={handleTrainSelect}
            defaultValue={storedTrainLabel || selectedTrain}
            variant="inline"
          />
        </MobileHeader>
        <LoadingState />
      </>
    );
  }

  if (isError && !data) {
    return (
      <>
        <JourneyDateDropdown
          value={journeyDate}
          onChange={handleJourneyDateChange}
          variant="fixed"
        />
        <SearchTrain
          onSelectTrain={handleTrainSelect}
          defaultValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <JourneyDateDropdown
            value={journeyDate}
            onChange={handleJourneyDateChange}
            variant="inline"
          />
          <SearchTrain
            onSelectTrain={handleTrainSelect}
            defaultValue={storedTrainLabel || selectedTrain}
            variant="inline"
          />
        </MobileHeader>
        <ErrorState
          message={error?.message || "Error loading train data"}
          onRetry={refetch}
        />
      </>
    );
  }

  if (stations.length === 0) {
    return (
      <>
        <JourneyDateDropdown
          value={journeyDate}
          onChange={handleJourneyDateChange}
          variant="fixed"
        />
        <SearchTrain
          onSelectTrain={handleTrainSelect}
          defaultValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <JourneyDateDropdown
            value={journeyDate}
            onChange={handleJourneyDateChange}
            variant="inline"
          />
          <SearchTrain
            onSelectTrain={handleTrainSelect}
            defaultValue={storedTrainLabel || selectedTrain}
            variant="inline"
          />
        </MobileHeader>
        <EmptyState />
      </>
    );
  }

  const liveJourneyDate = data?.liveData?.journeyDate ?? null;
  const distanceFromOriginKm =
    data?.liveData?.currentLocation?.distanceFromOriginKm ?? null;
  const currentLocationStatus = data?.liveData?.currentLocation?.status ?? null;
  const currentStationSequence =
    data?.liveData?.currentLocation?.sequence ?? null;
  const distanceFromLastStationKm =
    data?.liveData?.currentLocation?.distanceFromLastStationKm ?? null;
  const currentStationCode =
    data?.liveData?.currentLocation?.stationCode ?? null;
  const lastUpdatedAt = data?.liveData?.lastUpdatedAt ?? null;
  const destinationStationCode = data?.train?.destinationStationCode;

  return (
    <>
      <JourneyDateDropdown
        value={journeyDate}
        onChange={handleJourneyDateChange}
        variant="fixed"
      />
      <SearchTrain
        onSelectTrain={handleTrainSelect}
        defaultValue={storedTrainLabel || selectedTrain}
        variant="fixed"
      />

      <MobileHeader>
        <JourneyDateDropdown
          value={journeyDate}
          onChange={handleJourneyDateChange}
          variant="inline"
        />
        <SearchTrain
          onSelectTrain={handleTrainSelect}
          defaultValue={storedTrainLabel || selectedTrain}
          variant="inline"
        />
      </MobileHeader>

      <CircularRotator
        stations={stations}
        journeyDate={liveJourneyDate}
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
