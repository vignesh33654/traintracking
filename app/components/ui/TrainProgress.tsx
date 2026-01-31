import { cn } from "@/app/utils/utils";
import type { RouteStation } from "@/app/types/train.types";
import {
  getProgressState,
  calculatePercentage,
  generateProgressArcPath,
} from "@/app/utils/train-progress-utils";

export interface TrainProgressProps {
  distanceFromOriginKm?: number | null;
  route?: RouteStation[];
  currentStationCode?: string | null;
  destinationStationCode?: string;
  size?: number;
  className?: string;
}

export function TrainProgress({
  distanceFromOriginKm,
  route,
  currentStationCode,
  destinationStationCode,
  size = 34,
  className,
}: TrainProgressProps) {
  // Calculate total distance from route
  const totalDistanceKm = route && route.length > 0
    ? route[route.length - 1].distanceFromSourceKm
    : 0;

  const state = getProgressState(
    distanceFromOriginKm,
    currentStationCode,
    destinationStationCode
  );

  const percentage = calculatePercentage(
    state,
    distanceFromOriginKm,
    totalDistanceKm
  );

  // Fixed sizes based on Figma design
  const svgSize = 24; // Outer ring is 24px
  const innerRadius = 8; // Inner filled segment is 16px diameter (8px radius)
  const strokeWidth = 1;
  const center = svgSize / 2;

  const isActive = state === "in-progress" || state === "complete";
  const isComplete = state === "complete";

  // Calculate arc angle (0-360 degrees based on percentage)
  const arcAngle = (percentage / 100) * 360;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Train journey ${Math.round(percentage)}% complete`}
      className={cn("relative flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {/* Outer ring (always visible) - 24px */}
        <circle
          cx={center}
          cy={center}
          r={(svgSize / 2) - strokeWidth / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={isActive ? "text-green" : "text-bg-1"}
        />

        {/* Inner filled segment */}
        {state === "not-started" && (
          // Small dot in center for not started state
          <circle
            cx={center}
            cy={center}
            r={1}
            fill="currentColor"
            className="text-bg-1"
          />
        )}

        {state === "in-progress" && percentage > 0 && (
          // Pie segment for in-progress state
          <path
            d={generateProgressArcPath(center, center, innerRadius, -90, arcAngle - 90)}
            fill="currentColor"
            className="text-green transition-none "
          />
        )}

        {isComplete && (
          // Full inner circle for complete state
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="currentColor"
            className="text-green"
          />
        )}
      </svg>
    </div>
  );
}
