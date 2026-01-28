import { TRACK_PATH_CONFIG, TIME_PATH_OFFSET, STATION_PATH_OFFSET } from "../config/circular-rotator.config";

export const U_SHAPED_TRACK_PATH = `M ${TRACK_PATH_CONFIG.leftRailX} ${TRACK_PATH_CONFIG.railTop} L ${TRACK_PATH_CONFIG.leftRailX} ${TRACK_PATH_CONFIG.arcStartY} A ${TRACK_PATH_CONFIG.arcRadius} ${TRACK_PATH_CONFIG.arcRadius} 0 0 0 ${TRACK_PATH_CONFIG.rightRailX} ${TRACK_PATH_CONFIG.arcStartY} L ${TRACK_PATH_CONFIG.rightRailX} ${TRACK_PATH_CONFIG.railTop}`;

export function generateInnerPath(offset: number): string {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;

  const innerLeftX = leftRailX + offset;
  const innerRightX = rightRailX - offset;
  const innerRadius = arcRadius - offset;

  return `M ${innerLeftX} ${railTop} L ${innerLeftX} ${arcStartY} A ${innerRadius} ${innerRadius} 0 0 0 ${innerRightX} ${arcStartY} L ${innerRightX} ${railTop}`;
}

export function generateOuterPath(offset: number): string {
  const { leftRailX, rightRailX, railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;

  const outerLeftX = leftRailX - offset;
  const outerRightX = rightRailX + offset;
  const outerRadius = arcRadius + offset;

  return `M ${outerLeftX} ${railTop} L ${outerLeftX} ${arcStartY} A ${outerRadius} ${outerRadius} 0 0 0 ${outerRightX} ${arcStartY} L ${outerRightX} ${railTop}`;
}

export const INNER_TIME_PATH = generateInnerPath(TIME_PATH_OFFSET);

let cachedPath: SVGPathElement | null = null;
let cachedTotalLength: number | null = null;
let cachedOuterPath: SVGPathElement | null = null;

function calculatePathTotalLength(): number {
  const { railTop, arcStartY, arcRadius } = TRACK_PATH_CONFIG;
  const straightLength = arcStartY - railTop;
  const arcLength = Math.PI * arcRadius;
  return 2 * straightLength + arcLength;
}

function isBrowser(): boolean {
  return typeof document !== "undefined";
}

function createTrackPathElement(): SVGPathElement | null {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", U_SHAPED_TRACK_PATH);
    svg.appendChild(path);

    if (typeof path.getTotalLength !== "function" || typeof path.getPointAtLength !== "function") {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export function getTrackPath(): SVGPathElement | null {
  if (!isBrowser()) return null;
  if (!cachedPath) {
    cachedPath = createTrackPathElement();
  }
  return cachedPath;
}

export function getPathTotalLength(): number {
  if (cachedTotalLength === null) {
    cachedTotalLength = calculatePathTotalLength();
  }
  return cachedTotalLength;
}

function createOuterPathElement(): SVGPathElement | null {
  try {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const outerPathString = generateOuterPath(STATION_PATH_OFFSET);
    path.setAttribute("d", outerPathString);
    svg.appendChild(path);

    if (typeof path.getTotalLength !== "function" || typeof path.getPointAtLength !== "function") {
      return null;
    }

    return path;
  } catch {
    return null;
  }
}

export function getOuterTrackPath(): SVGPathElement | null {
  if (!isBrowser()) return null;
  if (!cachedOuterPath) {
    cachedOuterPath = createOuterPathElement();
  }
  return cachedOuterPath;
}

export function resetCache(): void {
  cachedPath = null;
  cachedTotalLength = null;
  cachedOuterPath = null;
}
