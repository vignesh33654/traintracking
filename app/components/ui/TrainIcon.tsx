import { cn } from "@/app/utils/utils";
import { StatusDot } from "./StatusDot";
import type { CSSProperties, ReactNode } from "react";

export interface TrainIconProps {
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  showStatusDot?: boolean;
  className?: string;
  x?: number;
  y?: number;
  rotation?: number;
  counterRotation?: number;
  isOnTrack?: boolean;
  children?: ReactNode;
}

export function TrainIcon({
  journeyDate,
  distanceFromOriginKm,
  showStatusDot = true,
  className,
  x = 0,
  y = 0,
  rotation = 0,
  counterRotation = 0,
  isOnTrack = false,
  children,
}: TrainIconProps) {
  const trackPositionStyle: CSSProperties = isOnTrack
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${rotation}deg)`,
        zIndex: 50,
      }
    : {};

  const innerRotationStyle: CSSProperties = isOnTrack
    ? { transform: `rotate(${counterRotation}deg)` }
    : {};

  return (
    <div
      className={cn("relative size-[30px]", className)}
      style={trackPositionStyle}
    >
      <div
        className="flex items-center justify-center size-full rounded-full border border-bg-1 bg-bg-0"
        style={innerRotationStyle}
      >
        {children || (
          <div
            className="size-[16px] bg-text-primary"
            style={{
              maskImage: 'url("/Train icon.svg")',
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: 'url("/Train icon.svg")',
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
            aria-label="Train"
          />
        )}
      </div>
      {showStatusDot && (
        <StatusDot
          journeyDate={journeyDate}
          distanceFromOriginKm={distanceFromOriginKm}
          size="sm"
          className="absolute top-[7px] right-[7px]"
        />
      )}
    </div>
  );
}
