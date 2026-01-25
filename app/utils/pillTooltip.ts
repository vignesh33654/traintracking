import { TRACK_PATH_CONFIG } from "../config/circular-rotator.config";

export type TooltipDirection = "left" | "right";

export const TOOLTIP_OFFSETS = {
  left: { x: 28, y: 20 },
  right: { x: 28, y: 19 },
} as const;

export function getTooltipDirection(x: number): TooltipDirection {
  const { leftRailX, rightRailX } = TRACK_PATH_CONFIG;
  const midX = (leftRailX + rightRailX) / 2;
  return x < midX ? "left" : "right";
}
