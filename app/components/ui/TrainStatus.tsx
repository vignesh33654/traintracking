import { cn } from "@/app/utils/utils";
import type { RouteStation } from "@/app/types/train.types";

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

function formatRelativeTime(lastUpdatedAt: string | null | undefined): string {
  if (!lastUpdatedAt) return "JUST NOW";
  const diffMinutes = Math.floor((Date.now() - new Date(lastUpdatedAt).getTime()) / 60000);
  if (diffMinutes < 1) return "JUST NOW";
  if (diffMinutes === 1) return "1 MIN AGO";
  return `${diffMinutes} MINS AGO`;
}

function getStationName(code: string | null | undefined, route?: RouteStation[]): string {
  if (!code || !route) return "";
  return route.find((s) => s.stationCode === code)?.stationName ?? "";
}

function getNextStationName(sequence: number | null | undefined, route?: RouteStation[]): string {
  if (sequence == null || !route) return "";
  return route.find((s) => s.sequence === sequence + 1)?.stationName ?? "";
}

function getStatusMessage(props: TrainStatusProps): string {
  const {
    currentLocationStatus,
    distanceFromLastStationKm,
    currentStationCode,
    currentSequence,
    route,
    destinationStationCode,
  } = props;

  if (currentStationCode && currentStationCode  === destinationStationCode) {
    return "REACHED YOUR DESTINATION";
  }

  if (currentLocationStatus === "AT_STATION" || currentLocationStatus === "ARRIVED") {
    const name = getStationName(currentStationCode, route);
    return `ARRIVED AT ${name}`;
  }

  if (distanceFromLastStationKm != null && distanceFromLastStationKm > 0) {
    const nextName = getNextStationName(currentSequence, route);
    const dist = Math.round(distanceFromLastStationKm);
    return `${dist} KM TO ${nextName}`;
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
