"use client";

import { RefObject, useLayoutEffect } from "react";
import { calculateInitialScrollTop } from "../utils/circular-rotator-calculations";

interface UseInitialStationScrollParams {
  scrollRef: RefObject<HTMLDivElement | null>;
  stationsLength: number;
  initialStationIndex: number;
  pillsPerStation: number;
  gapRatio: number;
  scrollRange: number;
  totalScrollHeight: number;
}

export function useInitialStationScroll({
  scrollRef,
  stationsLength,
  initialStationIndex,
  pillsPerStation,
  gapRatio,
  scrollRange,
  totalScrollHeight,
}: UseInitialStationScrollParams) {
  useLayoutEffect(() => {
    if (!scrollRef.current || stationsLength === 0) return;
    const scrollTop = calculateInitialScrollTop(
      initialStationIndex,
      pillsPerStation,
      gapRatio,
      scrollRange,
      totalScrollHeight
    );
    window.scrollTo({ top: scrollTop, behavior: "auto" });
  }, [
    scrollRef,
    stationsLength,
    initialStationIndex,
    pillsPerStation,
    gapRatio,
    scrollRange,
    totalScrollHeight,
  ]);
}
