import { cn } from "@/app/utils/utils";
import type { RouteStation } from "@/app/types/train.types";
import { getNextStationSummary, getStationName } from "@/app/utils/train-status.utils";
import { formatRelativeTime } from "@/app/utils/time-formatters";

export interface TrainStatusProps {
  className?: string;
  lastUpdatedAt?: string | null;
  currentLocationStatus?: string | null;
  distanceFromLastStationKm?: number | null;
  distanceFromOriginKm?: number | null;
  currentStationCode?: string | null;
  currentSequence?: number | null;
  route?: RouteStation[];
  destinationStationCode?: string;
}

function getStatusMessage(props: TrainStatusProps): string {
  const {
    currentLocationStatus,
    distanceFromLastStationKm,
    distanceFromOriginKm,
    currentStationCode,
    currentSequence,
    route,
    destinationStationCode,
  } = props;

  if (currentStationCode && currentStationCode === destinationStationCode) {
    return "REACHED YOUR DESTINATION";
  }

  // Only show "ARRIVED" if train has actually started (moved from origin)
  if ((currentLocationStatus === "AT_STATION" || currentLocationStatus === "ARRIVED") &&
      distanceFromOriginKm != null && distanceFromOriginKm > 0) {
    const name = getStationName(currentStationCode, route);
    return `ARRIVED AT ${name}`;
  }

  const { nextStationName, distanceToNextKm } = getNextStationSummary(
    currentSequence,
    currentStationCode,
    distanceFromOriginKm,
    route
  );

  if (currentLocationStatus === "DEPARTED" && distanceFromLastStationKm != null) {
    if (distanceToNextKm != null && nextStationName) {
      return `${Math.round(distanceToNextKm)} KM TO ${nextStationName}`;
    }
  }

  if (distanceFromLastStationKm != null && distanceFromLastStationKm > 0) {
    if (distanceToNextKm != null && nextStationName) {
      return `${Math.round(distanceToNextKm)} KM TO ${nextStationName}`;
    }
  }

  return "NOT STARTED YET";
}

export function TrainStatus(props: TrainStatusProps) {
  const { className, lastUpdatedAt } = props;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Train status information"
      className={cn(
        "absolute left-1/2 top-[546px] -translate-y-1/2 -rotate-90 origin-left",
        "flex items-center max-w-[500px] gap-2",
        className
      )}
    >
      <div
        className="shrink-0 size-[34px] rounded-full border border-bg-1 "
        aria-hidden="true"
      />
      <div className="flex flex-col gap-pill-dot justify-center min-w-0 shrink-0">
        <p className="font-b612-mono-9 text-text-secondary uppercase tracking-[-0.4px] leading-[12px] whitespace-nowrap">
          LAST UPDATED {formatRelativeTime(lastUpdatedAt)}
        </p>
        <p className="font-b612-mono-12 text-text-primary uppercase tracking-[-0.48px] leading-[20px] whitespace-nowrap">
          {getStatusMessage(props)}
        </p>
      </div>
    </div>
  );
}
