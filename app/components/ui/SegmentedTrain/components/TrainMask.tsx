import { U_SHAPED_TRACK_PATH } from "../../../../utils/track-path";
import { TRACK_CONTAINER_WIDTH, TRACK_VIEWPORT_HEIGHT } from "../../../../config/circular-rotator.config";
import { TRAIN_CONFIG } from "../../../../config/train.config";
import type { SliceConfig } from "../types/types";

interface TrainMaskProps {
  maskSlice: SliceConfig;
  backgroundColor: string;
}

/**
 * Renders a shared-path mask behind trailing cars to smooth curvature
 */
export function TrainMask({ maskSlice, backgroundColor }: TrainMaskProps) {
  const { width, mask } = TRAIN_CONFIG;
  const maskColor = mask?.color ?? backgroundColor;

  return (
    <svg
      className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none select-none"
      width={TRACK_CONTAINER_WIDTH}
      height={TRACK_VIEWPORT_HEIGHT}
      viewBox={`0 0 ${TRACK_CONTAINER_WIDTH} ${TRACK_VIEWPORT_HEIGHT}`}
      style={{ zIndex: 50 }}
      aria-hidden
    >
      <path
        d={U_SHAPED_TRACK_PATH}
        fill="none"
        stroke={maskColor}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={maskSlice.dasharray}
        strokeDashoffset={maskSlice.dashoffset}
        opacity={mask?.opacity ?? 1}
      />
    </svg>
  );
}
