import { cn } from "@/app/utils/utils";

export interface TrainProgressProps {
  distanceFromOriginKm?: number | null;
  totalDistanceKm: number;
  currentStationCode?: string | null;
  destinationStationCode?: string;
  size?: number;
  className?: string;
}

type ProgressState = "not-started" | "in-progress" | "complete";

function getProgressState(
  distanceFromOriginKm: number | null | undefined,
  currentStationCode: string | null | undefined,
  destinationStationCode: string | undefined
): ProgressState {
  // Check if reached destination first
  if (
    currentStationCode &&
    destinationStationCode &&
    currentStationCode === destinationStationCode
  ) {
    return "complete";
  }

  // Check if train has started
  if (distanceFromOriginKm != null && distanceFromOriginKm > 0) {
    return "in-progress";
  }

  return "not-started";
}

function calculatePercentage(
  state: ProgressState,
  distanceFromOriginKm: number | null | undefined,
  totalDistanceKm: number
): number {
  if (state === "complete") {
    return 100;
  }

  if (state === "not-started" || totalDistanceKm <= 0) {
    return 0;
  }

  const percentage = ((distanceFromOriginKm ?? 0) / totalDistanceKm) * 100;
  return Math.min(100, Math.max(0, percentage));
}

// Generate SVG arc path for pie segment
function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees + 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function TrainProgress({
  distanceFromOriginKm,
  totalDistanceKm,
  currentStationCode,
  destinationStationCode,
  size = 34,
  className,
}: TrainProgressProps) {
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
            d={describeArc(center, center, innerRadius, -90, arcAngle - 90)}
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
