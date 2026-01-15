"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useMemo } from "react";
import PillItem from "./PillItem";
import { getPositionOnPath, TRACK_CONFIG } from "../../utils/circular-rotator-utils";
import { useTrainData } from "../../hooks/useTrainData";
import { useTrainScroll } from "../../hooks/useTrainScroll";
import { calculatePillProgress } from "../../utils/train-scroll-calculator";
import { useStationToggle } from "../../hooks/useStationToggle";
import { categorizeStations, calculatePillCount, getPillStation, type PillStationInfo } from "../../utils/station-filter";

const TRACK_CONTAINER_WIDTH = 360;
const INNER_TRACK_CONFIG = {
  height: 744,
  width: 254,
  borderRadius: 334,
  top: -158,
};
const OUTER_TRACK_CONFIG = {
  height: 792,
  width: 306,
  borderRadius: 334,
  top: -178,
};

interface CircularRotatorProps {
  trainNumber: string;
  pillGap?: number;
  pillsPerStation?: number;
}

interface TrackItemProps {
  index: number;
  gapRatio: number;
  scrollRange: number;
  scrollYProgress: MotionValue<number>;
  stationName: string;
  isActualStation: boolean;
  isHalt: boolean;
  onDoubleClick: () => void;
}

// Individual pill that animates along the U-shaped track based on scroll
function TrackItem({ 
  index, 
  gapRatio, 
  scrollRange, 
  scrollYProgress, 
  stationName, 
  isActualStation, 
  isHalt, 
  onDoubleClick 
}: TrackItemProps) {
  const progress = useTransform(
    scrollYProgress, 
    (scrollProgress: number) => calculatePillProgress(index, scrollProgress, gapRatio, scrollRange)
  );
  
  const clampedProgress = useTransform(progress, (p) => p.clampedProgress);
  const isVisible = useTransform(progress, (p) => p.isVisible);
  
  const position = useTransform(
    clampedProgress, 
    (value) => getPositionOnPath(1 - value, TRACK_CONFIG)
  );

  const transform = useTransform(
    position, 
    (p) => `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.rotation}deg)`
  );
  
  const opacity = useTransform(isVisible, (visible) => (visible ? 1 : 0));

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{
        transform,
        transformOrigin: "center center",
        opacity,
      }}
      suppressHydrationWarning
    >
      <PillItem 
        stationName={stationName}
        isActualStation={isActualStation}
        isHalt={isHalt}
        onDoubleClick={onDoubleClick}
      />
    </motion.div>
  );
}

function TrackRails() {
  return (
    <>
      <div
        className="absolute left-1/2 -translate-x-1/2 border border-bg-1 border-solid rounded-[334px]" 
        style={{
          height: `${INNER_TRACK_CONFIG.height}px`,
          width: `${INNER_TRACK_CONFIG.width}px`,
          borderRadius: `${INNER_TRACK_CONFIG.borderRadius}px`,
          top: `${INNER_TRACK_CONFIG.top}px`,
        }}
      />
      <div 
        className="absolute left-1/2 -translate-x-1/2 border border-bg-1 border-solid rounded-[334px]" 
        style={{
          height: `${OUTER_TRACK_CONFIG.height}px`,
          width: `${OUTER_TRACK_CONFIG.width}px`,
          borderRadius: `${OUTER_TRACK_CONFIG.borderRadius}px`,
          top: `${OUTER_TRACK_CONFIG.top}px`,
        }}
      />
    </>
  );
}

export default function CircularRotator({ 
  trainNumber, 
  pillGap = 24, 
  pillsPerStation = 4
}: CircularRotatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: trainData } = useTrainData(trainNumber);
  const { showAllStations, toggleStations } = useStationToggle();

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const { haltStations, nonHaltStations } = useMemo(
    () => categorizeStations(trainData?.route),
    [trainData?.route]
  );
  
  const itemCount = useMemo(
    () => calculatePillCount(haltStations.length, nonHaltStations.length, pillsPerStation, showAllStations),
    [haltStations.length, nonHaltStations.length, pillsPerStation, showAllStations]
  );
  
  const { gapRatio, scrollRange, totalScrollHeight } = useTrainScroll(
    haltStations.length,
    pillGap,
    pillsPerStation
  );

  const getPillInfo = (pillIndex: number): PillStationInfo => {
    return getPillStation(pillIndex, haltStations, nonHaltStations, pillsPerStation, showAllStations);
  };

  const pills = useMemo(
    () => Array.from({ length: itemCount }, (_, index) => ({
      index,
      ...getPillInfo(index),
    })),
    [itemCount, haltStations, nonHaltStations, showAllStations]
  );

  return (
    <div ref={scrollRef} className="relative" style={{ height: `${totalScrollHeight}px` }}>
      <div className="sticky top-0 w-full h-screen flex items-center justify-center">
        <div 
          className="relative h-full bg-bg-0" 
          style={{ width: `${TRACK_CONTAINER_WIDTH}px` }}
        >
          <TrackRails />
          
          {pills.map(({ index, stationName, isActualStation, isHalt }) => (
            <TrackItem
              key={index}
              index={index}
              gapRatio={gapRatio}
              scrollRange={scrollRange}
              scrollYProgress={scrollYProgress}
              stationName={stationName}
              isActualStation={isActualStation}
              isHalt={isHalt}
              onDoubleClick={toggleStations}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

