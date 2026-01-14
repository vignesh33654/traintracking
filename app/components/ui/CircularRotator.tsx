"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import PillItem from "./PillItem";
import { cn } from "../../utils/utils";
import { getPositionOnPath, TRACK_CONFIG } from "../../utils/circular-rotator-utils";
import { useTrainData } from "../../hooks/useTrainData";

interface CircularRotatorProps {
  trainNumber: string;
}

function TrackItem({ index, itemCount, scrollYProgress }: { index: number; itemCount: number; scrollYProgress: any }) {
  const baseT = index / itemCount;
  const t = useTransform(scrollYProgress, (progress: number) => {
    return (baseT + progress) % 1;
  });
  
  const position = useTransform(t, (value) => {
    return getPositionOnPath(value, TRACK_CONFIG);
  });

  const transform = useTransform(position, (p) => {
    return `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.rotation}deg)`;
  });

  return (
    <motion.div
      className={cn("absolute left-0 top-0")}
      style={{
        transform: transform,
        transformOrigin: "center center",
      }}
      suppressHydrationWarning
    >
      <PillItem />
    </motion.div>
  );
}

export default function CircularRotator({ trainNumber }: CircularRotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: trainData } = useTrainData(trainNumber);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: scrollRef,
  });

  const itemCount = useMemo(() => {
    return trainData?.route?.length || 100;
  }, [trainData]);

  const scrollItemSpacing = 24;
  const totalScrollHeight = itemCount * scrollItemSpacing;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-screen overflow-y-scroll overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      )}
    >
      <div ref={scrollRef} className={cn("relative")} style={{ height: `${totalScrollHeight}px` }}>
        <div className={cn("sticky top-0 w-full h-screen flex items-center justify-center")}>
          <div className={cn("relative w-[360px] h-full bg-bg-0")}>
            <div className="absolute border border-bg-1 border-solid h-[744px] left-1/2 rounded-[334px] top-[-158px] -translate-x-1/2 w-[254px]" />
            <div className="absolute border border-bg-1 border-solid h-[792px] left-1/2 rounded-[334px] top-[-178px] -translate-x-1/2 w-[306px]" />
            
            {Array.from({ length: itemCount }).map((_, index) => (
              <TrackItem
                key={index}
                index={index}
                itemCount={itemCount}
                scrollYProgress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

