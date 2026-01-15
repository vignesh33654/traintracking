"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import PillItem from "./PillItem";
import { cn } from "../../utils/utils";
import { getPositionOnPath, getPathTotalLength, TRACK_CONFIG } from "../../utils/circular-rotator-utils";
import { useTrainData } from "../../hooks/useTrainData";

interface CircularRotatorProps {
  trainNumber: string;
  pillGap?: number;
  pillsPerStation?: number;
}

interface TrackItemProps {
  index: number;
  normalizedGap: number;
  scrollRange: number;
  scrollYProgress: any;
  stationName: string;
}

function TrackItem({ index, normalizedGap, scrollRange, scrollYProgress, stationName }: TrackItemProps) {
  const baseT = index * normalizedGap;
  
  const rawT = useTransform(scrollYProgress, (progress: number) => {
    return baseT + progress * scrollRange;
  });
  
  const t = useTransform(rawT, (value) => Math.min(1, Math.max(0, value)));
  
  const isVisible = useTransform(rawT, (value) => value >= 0 && value <= 1);
  
  const position = useTransform(t, (value) => {
    return getPositionOnPath(1 - value, TRACK_CONFIG);
  });

  const transform = useTransform(position, (p) => {
    return `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.rotation}deg)`;
  });
  
  const opacity = useTransform(isVisible, (visible) => visible ? 1 : 0);

  return (
    <motion.div
      className={cn("absolute left-0 top-0")}
      style={{
        transform: transform,
        transformOrigin: "center center",
        opacity: opacity,
      }}
      suppressHydrationWarning
    >
      <PillItem stationName={stationName} />
    </motion.div>
  );
}

export default function CircularRotator({ 
  trainNumber, 
  pillGap = 24, 
  pillsPerStation = 1 
}: CircularRotatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: trainData } = useTrainData(trainNumber);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  const stationCount = trainData?.route?.length || 0;
  const itemCount = stationCount * pillsPerStation;
  
  const pathTotalLength = getPathTotalLength(TRACK_CONFIG);
  const normalizedGap = pillGap / pathTotalLength;
  const contentLength = (itemCount - 1) * normalizedGap;
  const scrollRange = 1 - contentLength;
  
  const minScrollDistance = itemCount * pillGap;
  const totalScrollHeight = Math.max(minScrollDistance, Math.abs(scrollRange) * pathTotalLength) + (typeof window !== 'undefined' ? window.innerHeight : 800);

  const getStationName = (pillIndex: number) => {
    const stationIndex = Math.floor(pillIndex / pillsPerStation);
    return trainData?.route[stationIndex]?.stationName || '';
  };

  return (
    <div ref={scrollRef} className={cn("relative")} style={{ height: `${totalScrollHeight}px` }}>
      <div className={cn("sticky top-0 w-full h-screen flex items-center justify-center")}>
        <div className={cn("relative w-[360px] h-full bg-bg-0")}>
          <div className="absolute border border-bg-1 border-solid h-[744px] left-1/2 rounded-[334px] top-[-158px] -translate-x-1/2 w-[254px]" />
          <div className="absolute border border-bg-1 border-solid h-[792px] left-1/2 rounded-[334px] top-[-178px] -translate-x-1/2 w-[306px]" />
          
          {Array.from({ length: itemCount }).map((_, index) => (
            <TrackItem
              key={index}
              index={index}
              normalizedGap={normalizedGap}
              scrollRange={scrollRange}
              scrollYProgress={scrollYProgress}
              stationName={getStationName(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

