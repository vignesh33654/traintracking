import type { RouteStation } from "@/app/types/train.types";

export function getStationName(code: string | null | undefined, route?: RouteStation[]): string {
  if (!code || !route) return "";
  return route.find((s) => s.stationCode === code)?.stationName ?? "";
}

function getNextStationByCode(
  currentStationCode: string | null | undefined,
  route?: RouteStation[]
): RouteStation | null {
  if (!currentStationCode || !route) return null;
  const currentIndex = route.findIndex((s) => s.stationCode === currentStationCode);
  if (currentIndex === -1 || currentIndex >= route.length - 1) return null;
  return route[currentIndex + 1];
}

export interface NextStationSummary {
  nextStationName: string;
  nextStationCode: string | null;
  distanceToNextKm: number | null;
}

// Compute next station details (name, code, distance) from current position
export function getNextStationSummary(
  currentSequence: number | null | undefined,
  currentStationCode: string | null | undefined,
  distanceFromOriginKm: number | null | undefined,
  route?: RouteStation[]
): NextStationSummary {
  if (!route) {
    return {
      nextStationName: "",
      nextStationCode: null,
      distanceToNextKm: null,
    };
  }

  let nextStation: RouteStation | null = null;

  if (currentSequence != null) {
    nextStation = route.find((s) => s.sequence === currentSequence + 1) ?? null;
  }

  if (!nextStation && currentStationCode) {
    nextStation = getNextStationByCode(currentStationCode, route);
  }

  if (!nextStation) {
    return {
      nextStationName: "",
      nextStationCode: null,
      distanceToNextKm: null,
    };
  }

  let distanceToNextKm: number | null = null;

  if (distanceFromOriginKm != null) {
    const distanceToNext = nextStation.distanceFromSourceKm - distanceFromOriginKm;
    distanceToNextKm = Math.max(0, distanceToNext);
  }

  return {
    nextStationName: nextStation.stationName,
    nextStationCode: nextStation.stationCode,
    distanceToNextKm,
  };
}

