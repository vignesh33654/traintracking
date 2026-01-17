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

function createTrackPathElement(): SVGPathElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", U_SHAPED_TRACK_PATH);
  svg.appendChild(path);
  return path;
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
    const path = getTrackPath();
    cachedTotalLength = path ? path.getTotalLength() : calculatePathTotalLength();
  }
  return cachedTotalLength;
}
