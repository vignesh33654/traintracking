import { useId } from "react";
import { U_SHAPED_TRACK_PATH } from "../../../../utils/track-path";
import { TRACK_CONTAINER_WIDTH, TRACK_VIEWPORT_HEIGHT } from "../../../../config/circular-rotator.config";
import { TRAIN_CONFIG } from "../../../../config/train.config";
import type { SliceConfig } from "../types/types";

interface TrainShadowProps {
  shadowSlice: SliceConfig;
  isDark: boolean;
}

/**
 * Renders the shadow behind the train (hidden in dark mode)
 */
export function TrainShadow({ shadowSlice, isDark }: TrainShadowProps) {
  const shadowFilterId = useId();
  const { shadow } = TRAIN_CONFIG;

  if (!shadow?.enabled || isDark) {
    return null;
  }

  return (
    <svg
      className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none select-none"
      width={TRACK_CONTAINER_WIDTH}
      height={TRACK_VIEWPORT_HEIGHT}
      viewBox={`0 0 ${TRACK_CONTAINER_WIDTH} ${TRACK_VIEWPORT_HEIGHT}`}
      style={{ zIndex: shadow.zIndex }}
      aria-hidden
    >
      <defs>
        <filter id={shadowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={shadow.blur} />
        </filter>
      </defs>
      <path
        d={U_SHAPED_TRACK_PATH}
        fill="none"
        stroke={shadow.color}
        strokeWidth={shadow.width}
        strokeLinecap="round"
        strokeDasharray={shadowSlice.dasharray}
        strokeDashoffset={shadowSlice.dashoffset}
        opacity={shadow.opacity}
        filter={`url(#${shadowFilterId})`}
        transform={`translate(${shadow.offsetX}, ${shadow.offsetY})`}
      />
    </svg>
  );
}
