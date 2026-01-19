import { TRACK_PATH_CONFIG } from "../config/circular-rotator.config";

// U-shaped track path: left rail → bottom arc → right rail
export const U_SHAPED_TRACK_PATH = `M ${TRACK_PATH_CONFIG.leftRailX} ${TRACK_PATH_CONFIG.railTop} L ${TRACK_PATH_CONFIG.leftRailX} ${TRACK_PATH_CONFIG.arcStartY} A ${TRACK_PATH_CONFIG.arcRadius} ${TRACK_PATH_CONFIG.arcRadius} 0 0 0 ${TRACK_PATH_CONFIG.rightRailX} ${TRACK_PATH_CONFIG.arcStartY} L ${TRACK_PATH_CONFIG.rightRailX} ${TRACK_PATH_CONFIG.railTop}`;

let cachedPath: SVGPathElement | null = null;
let cachedTotalLength: number | null = null;

// Total length = 2 * straightLength + arcLength
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

    // Verify the path element actually supports the methods we need
    if (typeof path.getTotalLength !== 'function' || typeof path.getPointAtLength !== 'function') {
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
    // Always use mathematical calculation since path is defined by constants
    // Browser's getTotalLength() adds no value here
    cachedTotalLength = calculatePathTotalLength();
  }
  return cachedTotalLength;
}

// Export for tests - allows cache invalidation
export function resetCache(): void {
  cachedPath = null;
  cachedTotalLength = null;
}
