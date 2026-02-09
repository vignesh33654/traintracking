"use client";

import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { API_CONFIG } from "@/app/config/api.config";
import { useTrainData } from "@/app/hooks/useTrainData";
import { getTodayDate } from "@/app/utils/todaydate";
import CircularRotator from "@/app/components/ui/CircularRotator/CircularRotator";
import LoadingState from "@/app/components/layout/LoadingState";
import EmptyState from "@/app/components/layout/EmptyState";
import ErrorState from "@/app/components/layout/ErrorState";
import { StatusCard } from "../ui/FooterDottedCard";
import { TopControlsContainer } from "@/app/components/ui/TopHeader";
import MobileHeader from "@/app/components/ui/MobileHeader";
import { getStoredTrain } from "@/app/components/ui/SearchTrain/store";

export default function Home() {
  const [journeyDate, setJourneyDate] = useState<string>(() => getTodayDate());
  const [hasUserChangedDate, setHasUserChangedDate] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = getStoredTrain();
      return stored?.number || API_CONFIG.trainNumber;
    }
    return API_CONFIG.trainNumber;
  });
  const [userActionTrigger, setUserActionTrigger] = useState(0);

  const storedTrainLabel =
    typeof window !== "undefined" ? getStoredTrain()?.label : undefined;

  const pendingTooltipRef = useRef(true);

  const handleTrainSelect = useCallback((trainNumber: string) => {
    setSelectedTrain(trainNumber);
    pendingTooltipRef.current = true;
  }, []);

  const handleJourneyDateChange = useCallback((date: string) => {
    setJourneyDate(date);
    setHasUserChangedDate(true);
    pendingTooltipRef.current = true;
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useTrainData(
    selectedTrain,
    { journeyDate },
  );

  const liveJourneyDate = data?.liveData?.journeyDate ?? null;
  useEffect(() => {
    if (liveJourneyDate && !hasUserChangedDate) {
      setJourneyDate(liveJourneyDate);
    }
  }, [liveJourneyDate, hasUserChangedDate]);

  useEffect(() => {
    setHasUserChangedDate(false);
  }, [selectedTrain]);

  useEffect(() => {
    if (pendingTooltipRef.current && !isFetching && data) {
      pendingTooltipRef.current = false;
      queueMicrotask(() => setUserActionTrigger((prev) => prev + 1));
    }
  }, [isFetching, data]);

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
    setUserActionTrigger((prev) => prev + 1);
  }, [refetch]);

  if (isRestoring && !data) {
    return null;
  }

  if (isLoading && !data) {
    return (
      <>
        <TopControlsContainer
          journeyDate={journeyDate}
          onJourneyDateChange={handleJourneyDateChange}
          onSelectTrain={handleTrainSelect}
          defaultTrainValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <TopControlsContainer
            journeyDate={journeyDate}
            onJourneyDateChange={handleJourneyDateChange}
            onSelectTrain={handleTrainSelect}
            defaultTrainValue={storedTrainLabel || selectedTrain}
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
        <TopControlsContainer
          journeyDate={journeyDate}
          onJourneyDateChange={handleJourneyDateChange}
          onSelectTrain={handleTrainSelect}
          defaultTrainValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <TopControlsContainer
            journeyDate={journeyDate}
            onJourneyDateChange={handleJourneyDateChange}
            onSelectTrain={handleTrainSelect}
            defaultTrainValue={storedTrainLabel || selectedTrain}
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
        <TopControlsContainer
          journeyDate={journeyDate}
          onJourneyDateChange={handleJourneyDateChange}
          onSelectTrain={handleTrainSelect}
          defaultTrainValue={storedTrainLabel || selectedTrain}
          variant="fixed"
        />
        <MobileHeader>
          <TopControlsContainer
            journeyDate={journeyDate}
            onJourneyDateChange={handleJourneyDateChange}
            onSelectTrain={handleTrainSelect}
            defaultTrainValue={storedTrainLabel || selectedTrain}
            variant="inline"
          />
        </MobileHeader>
        <EmptyState />
      </>
    );
  }

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
      <TopControlsContainer
        journeyDate={journeyDate}
        onJourneyDateChange={handleJourneyDateChange}
        onSelectTrain={handleTrainSelect}
        defaultTrainValue={storedTrainLabel || selectedTrain}
        variant="fixed"
      />

      <MobileHeader>
        <TopControlsContainer
          journeyDate={journeyDate}
          onJourneyDateChange={handleJourneyDateChange}
          onSelectTrain={handleTrainSelect}
          defaultTrainValue={storedTrainLabel || selectedTrain}
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
        userActionTrigger={userActionTrigger}
      />

      <StatusCard train={data?.train ?? null} />
    </>
  );
}
