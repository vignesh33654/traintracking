import { TRACK_PATH_CONFIG, TOOLTIP_OFFSETS } from "../config/circular-rotator.config";

export type TooltipDirection = "left" | "right";

export { TOOLTIP_OFFSETS };

export function getTooltipDirection(x: number): TooltipDirection {
  const { leftRailX, rightRailX } = TRACK_PATH_CONFIG;
  const midX = (leftRailX + rightRailX) / 2;
  return x < midX ? "left" : "right";
}
