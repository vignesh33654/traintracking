"use client";

import { useTrainData } from "@/app/hooks/useTrainData";
import { API_CONFIG } from "@/app/config/api.config";

export function TrainStatusTest() {
  const { data } = useTrainData(API_CONFIG.trainNumber);

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║           TRAIN STATUS DATA CHECK                          ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  // 1. TRAIN (Static Info)
  console.log("\n📋 TRAIN (Static Info):");
  console.log("  trainNumber:", data?.train?.trainNumber);
  console.log("  trainName:", data?.train?.trainName);
  console.log("  type:", data?.train?.type);
  console.log("  sourceStationCode:", data?.train?.sourceStationCode);
  console.log("  sourceStationName:", data?.train?.sourceStationName);
  console.log("  destinationStationCode:", data?.train?.destinationStationCode);
  console.log("  destinationStationName:", data?.train?.destinationStationName);
  console.log("  totalHalts:", data?.train?.totalHalts);
  console.log("  distanceKm:", data?.train?.distanceKm);
  console.log("  travelTimeMinutes:", data?.train?.travelTimeMinutes);

  // 2. METADATA
  console.log("\n📊 METADATA:");
  console.log("  hasLiveData:", data?.metadata?.hasLiveData);
  console.log("  lastStaticUpdate:", data?.metadata?.lastStaticUpdate);
  console.log("  lastLiveUpdate:", data?.metadata?.lastLiveUpdate);
  console.log("  canRefreshLive:", data?.metadata?.canRefreshLive);

  // 3. JOURNEY STATUS
  console.log("\n🚦 JOURNEY STATUS:");
  console.log("  status:", data?.metadata?.journeyStatus?.status);
  console.log("  journeyDate:", data?.metadata?.journeyStatus?.journeyDate);
  console.log("  canFetchLiveData:", data?.metadata?.journeyStatus?.canFetchLiveData);
  console.log("  startTime:", data?.metadata?.journeyStatus?.startTime);
  console.log("  endTime:", data?.metadata?.journeyStatus?.endTime);

  // 4. LIVE DATA
  console.log("\n🔴 LIVE DATA:");
  console.log("  trainNumber:", data?.liveData?.trainNumber);
  console.log("  trainName:", data?.liveData?.trainName);
  console.log("  journeyDate:", data?.liveData?.journeyDate);
  console.log("  lastUpdatedAt:", data?.liveData?.lastUpdatedAt);
  console.log("  overallDelayMinutes:", data?.liveData?.overallDelayMinutes);
  console.log("  dataSource:", data?.liveData?.dataSource);
  console.log("  exceptionInfo:", data?.liveData?.exceptionInfo);

  // 5. CURRENT LOCATION
  console.log("\n📍 CURRENT LOCATION:");
  console.log("  latitude:", data?.liveData?.currentLocation?.latitude);
  console.log("  longitude:", data?.liveData?.currentLocation?.longitude);
  console.log("  stationCode:", data?.liveData?.currentLocation?.stationCode);
  console.log("  sequence:", data?.liveData?.currentLocation?.sequence);
  console.log("  status:", data?.liveData?.currentLocation?.status);
  console.log("  distanceFromOriginKm:", data?.liveData?.currentLocation?.distanceFromOriginKm);
  console.log("  distanceFromLastStationKm:", data?.liveData?.currentLocation?.distanceFromLastStationKm);

  // 6. LIVE ROUTE (first 5 stations)
  console.log("\n🛤️ LIVE ROUTE (from liveData.route, first 5):");
  data?.liveData?.route?.slice(0, 5).forEach((station, i) => {
    console.log(`  [${i}] seq:${station.sequence} | ${station.stationCode} | arrival:${station.actualArrival} | departure:${station.actualDeparture} | delayArr:${station.delayArrivalMinutes} | delayDep:${station.delayDepartureMinutes}`);
  });

  // 7. STATIC ROUTE (first 5 stations)
  console.log("\n🗺️ STATIC ROUTE (from data.route, first 5):");
  data?.route?.slice(0, 5).forEach((station, i) => {
    console.log(`  [${i}] seq:${station.sequence} | ${station.stationCode} (${station.stationName}) | isHalt:${station.isHalt} | distKm:${station.distanceFromSourceKm}`);
  });

  // 8. FULL OBJECTS (collapsed)
  console.log("\n📦 FULL OBJECTS (expand to see):");
  console.log("  data.train:", data?.train);
  console.log("  data.metadata:", data?.metadata);
  console.log("  data.liveData:", data?.liveData);
  console.log("  data.route:", data?.route);

  console.log("\n════════════════════════════════════════════════════════════════");

  return null;
}
