"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import PillItem from "./PillItem";
import { cn } from "../../utils/utils";
import { getPositionOnPath, TRACK_CONFIG, calculateItemCount, calculateItemCountFromSpacing } from "../../utils/circular-rotator-utils";

interface CircularRotatorProps {
  stationCount?: number;
  itemsPerSegment?: number;
  itemSpacing?: number;
  itemCount?: number;
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

export default function CircularRotator({ 
  stationCount,
  itemsPerSegment = 5,
  itemSpacing,
  itemCount: propItemCount,
}: CircularRotatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    target: scrollRef,
  });

  const itemCount = useMemo(() => {
    if (propItemCount !== undefined) {
      return propItemCount;
    }
    if (stationCount !== undefined) {
      return calculateItemCount(stationCount, itemsPerSegment);
    }
    if (itemSpacing !== undefined) {
      return calculateItemCountFromSpacing(itemSpacing);
    }
    return 140;
  }, [propItemCount, stationCount, itemsPerSegment, itemSpacing]);

  const scrollItemSpacing = 24;
  const totalScrollHeight = itemCount * scrollItemSpacing;
  console.log("totalScrollHeight", totalScrollHeight);
  console.log("itemCount", itemCount);
  console.log("scrollItemSpacing", scrollItemSpacing);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-screen overflow-y-scroll overflow-x-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      )}
    >
      <div ref={scrollRef} className={cn("relative")} style={{ height: `${totalScrollHeight}px` }}>
        <div className={cn("sticky top-0 w-full h-screen flex items-center justify-center")}>
          <div className={cn("relative w-[390px] h-full bg-bg-0")}>
            {/* <div className="absolute border border-[#f4f4f4] border-solid h-[870px] left-1/2 rounded-[334px] top-[-158px] -translate-x-1/2 w-[250px]" />
            <div className="absolute border border-[#f4f4f4] border-solid h-[920px] left-1/2 rounded-[334px] top-[-178px] -translate-x-1/2 w-[295px]" /> */}
            
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

