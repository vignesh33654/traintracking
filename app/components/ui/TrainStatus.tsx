"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/app/utils/utils";
import type { RouteStation } from "@/app/types/train.types";
import { getStatusMessage } from "@/app/utils/train-status.utils";
import { formatRelativeTime } from "@/app/utils/time-formatters";
import { TrainProgress } from "./TrainProgress";
import { useSound } from "@/app/hooks/useSound";
import { SOUND_PATHS } from "@/app/config/audio.config";

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
  isTrainVisible?: boolean;
}

export function TrainStatus(props: TrainStatusProps) {
  const {
    className,
    lastUpdatedAt,
    distanceFromOriginKm,
    currentStationCode,
    destinationStationCode,
    isTrainVisible,
  } = props;

  const statusMessage = getStatusMessage(props);
  const { play: playNotStarted } = useSound(SOUND_PATHS.NOT_STARTED);
  const { play: playDestinationReached } = useSound(SOUND_PATHS.DESTINATION_REACHED);
  const prevStatusRef = useRef<string | null>(null);
  const pendingSoundRef = useRef<"not-started" | "destination-reached" | null>(null);

  // When status changes, queue the sound to play once train is visible
  useEffect(() => {
    if (statusMessage === prevStatusRef.current) return;
    prevStatusRef.current = statusMessage;

    if (statusMessage === "NOT STARTED YET") {
      pendingSoundRef.current = "not-started";
    } else if (statusMessage === "REACHED YOUR DESTINATION") {
      pendingSoundRef.current = "destination-reached";
    }
  }, [statusMessage]);

  // Play the pending sound when the train becomes visible
  useEffect(() => {
    if (!isTrainVisible || !pendingSoundRef.current) return;

    if (pendingSoundRef.current === "not-started") {
      playNotStarted();
    } else {
      playDestinationReached();
    }
    pendingSoundRef.current = null;
  }, [isTrainVisible, playNotStarted, playDestinationReached]);

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
      <TrainProgress
        distanceFromOriginKm={distanceFromOriginKm}
        route={props.route}
        currentStationCode={currentStationCode}
        destinationStationCode={destinationStationCode}
        size={34}
      />
      <div className="flex flex-col gap-pill-dot justify-center min-w-0 shrink-0">
        <p className="font-b612-mono-9 text-text-secondary uppercase tracking-[-0.4px] leading-[12px] whitespace-nowrap">
          LAST UPDATED {formatRelativeTime(lastUpdatedAt)}
        </p>
        <p className="font-b612-mono-12 text-text-primary uppercase tracking-[-0.48px] leading-[20px] whitespace-nowrap">
          {statusMessage}
        </p>
      </div>
    </div>
  );
}
