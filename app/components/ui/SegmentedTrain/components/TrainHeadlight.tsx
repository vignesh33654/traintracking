import Image from "next/image";
import { TRAIN_CONFIG } from "../../../../config/train.config";
import type { ProgressState } from "../../../../utils/train-progress-utils";
import type { SegmentPosition } from "../types/types";

interface TrainHeadlightProps {
  enginePosition: SegmentPosition;
  isDark: boolean;
  progressState: ProgressState;
}

/**
 * Renders the headlight beam (dark mode only) that rotates with train direction
 */
export function TrainHeadlight({ enginePosition, isDark, progressState }: TrainHeadlightProps) {
  const { headlight } = TRAIN_CONFIG;

  if (!headlight?.enabled) {
    return null;
  }

  if (headlight.darkModeOnly && !isDark) {
    return null;
  }

  if (progressState !== "in-progress") {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${enginePosition.x}px, ${enginePosition.y}px) translate(-50%, -50%) rotate(${enginePosition.rotation - 180}deg) translateY(${headlight.offsetY}px)`,
        width: headlight.width,
        height: headlight.height,
        zIndex: headlight.zIndex,
        opacity: headlight.opacity,
      }}
    >
      <Image
        src={headlight.file}
        alt=""
        width={headlight.width}
        height={headlight.height}
        priority
        className="pointer-events-none"
      />
    </div>
  );
}
