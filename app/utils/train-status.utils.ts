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

function getStationByCode(
  currentStationCode: string | null | undefined,
  route?: RouteStation[]
): RouteStation | null {
  if (!currentStationCode || !route) return null;
  return route.find((s) => s.stationCode === currentStationCode) ?? null;
}

function hasJourneyStarted(
  distanceFromOriginKm: number | null | undefined,
  currentSequence: number | null | undefined,
  currentStationCode: string | null | undefined,
  route?: RouteStation[]
): boolean {
  if (distanceFromOriginKm != null && distanceFromOriginKm > 0) return true;
  if (!route || route.length === 0) return false;

  const firstStation = route[0];
  if (currentSequence != null && currentSequence > firstStation.sequence) {
    return true;
  }

  return Boolean(
    currentStationCode && currentStationCode !== firstStation.stationCode
  );
}

function getEffectiveDistanceFromOriginKm(
  distanceFromOriginKm: number | null | undefined,
  currentStationCode: string | null | undefined,
  route?: RouteStation[]
): number | null {
  if (distanceFromOriginKm != null && distanceFromOriginKm > 0) {
    return distanceFromOriginKm;
  }

  const currentStation = getStationByCode(currentStationCode, route);
  if (currentStation && currentStation.distanceFromSourceKm > 0) {
    return currentStation.distanceFromSourceKm;
  }

  return distanceFromOriginKm ?? null;
}

export interface NextStationSummary {
  nextStationName: string;
  nextStationCode: string | null;
  distanceToNextKm: number | null;
}

// Compute next station details (name, code, distance) from current position
export interface StatusMessageParams {
  currentLocationStatus?: string | null;
  distanceFromLastStationKm?: number | null;
  distanceFromOriginKm?: number | null;
  currentStationCode?: string | null;
  currentSequence?: number | null;
  route?: RouteStation[];
  destinationStationCode?: string;
}

export function getStatusMessage(params: StatusMessageParams): string {
  const {
    currentLocationStatus,
    distanceFromLastStationKm,
    distanceFromOriginKm,
    currentStationCode,
    currentSequence,
    route,
    destinationStationCode,
  } = params;

  if (currentStationCode && currentStationCode === destinationStationCode) {
    return "REACHED YOUR DESTINATION";
  }

  const effectiveDistanceFromOriginKm = getEffectiveDistanceFromOriginKm(
    distanceFromOriginKm,
    currentStationCode,
    route
  );
  const journeyStarted = hasJourneyStarted(
    effectiveDistanceFromOriginKm,
    currentSequence,
    currentStationCode,
    route
  );

  if ((currentLocationStatus === "AT_STATION" || currentLocationStatus === "ARRIVED") &&
      journeyStarted) {
    const name = getStationName(currentStationCode, route);
    return `ARRIVED AT ${name}`;
  }

  const { nextStationName, distanceToNextKm } = getNextStationSummary(
    currentSequence,
    currentStationCode,
    effectiveDistanceFromOriginKm,
    route
  );

  if (currentLocationStatus === "DEPARTED" && distanceFromLastStationKm != null) {
    if (distanceToNextKm != null && nextStationName) {
      return `${Math.round(distanceToNextKm)} KM TO ${nextStationName}`;
    }
  }

  if (distanceFromLastStationKm != null && distanceFromLastStationKm > 0) {
    if (distanceToNextKm != null && nextStationName) {
      return `${Math.round(distanceToNextKm)} KM TO ${nextStationName}`;
    }
  }

  if (journeyStarted) {
    if (distanceToNextKm != null && nextStationName) {
      return `${Math.round(distanceToNextKm)} KM TO ${nextStationName}`;
    }

    const name = getStationName(currentStationCode, route);
    if (name) {
      return `ARRIVED AT ${name}`;
    }

    return "RUNNING";
  }

  return "NOT STARTED YET";
}

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
