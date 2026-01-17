import type { RouteStation } from '../types/train.types';

export interface StationCategories {
  haltStations: RouteStation[];
  nonHaltStations: RouteStation[];
  allStations: RouteStation[];
}

export interface PillStationInfo {
  stationName: string;
  isActualStation: boolean;
  isHalt: boolean;
}

const EMPTY_CATEGORIES: StationCategories = {
      haltStations: [],
      nonHaltStations: [],
      allStations: [],
    };

export function categorizeStations(route?: RouteStation[]): StationCategories {
  if (!route) return EMPTY_CATEGORIES;

  return {
    haltStations: route.filter((s) => s.isHalt === 1),
    nonHaltStations: route.filter((s) => s.isHalt === 0),
    allStations: route,
  };
}

// Total pills: (halt × pillsPerStation) + non-halt (if showAll is true)
export function calculatePillCount(
  haltCount: number,
  nonHaltCount: number,
  pillsPerStation: number,
  showAll: boolean
): number {
  const haltPills = haltCount * pillsPerStation;
  return showAll ? haltPills + nonHaltCount : haltPills;
  }
  
// Maps pill index to station info based on view mode
export function getPillStation(
  index: number,
  haltStations: RouteStation[],
  nonHaltStations: RouteStation[],
  pillsPerStation: number,
  showAll: boolean
): PillStationInfo {
  const haltPillsCount = haltStations.length * pillsPerStation;

  // Halt stations only view
  if (!showAll || index < haltPillsCount) {
    const stationIndex = Math.floor(index / pillsPerStation);
    const isFirstPill = index % pillsPerStation === 0;
    const station = haltStations[stationIndex];
    
    return {
      stationName: station?.stationName || '',
      isActualStation: isFirstPill && !!station,
      isHalt: true,
    };
  }

  // Non-halt stations (only in "show all" mode)
    const nonHaltIndex = index - haltPillsCount;
    const station = nonHaltStations[nonHaltIndex];
    
    return {
      stationName: station?.stationName || '',
      isActualStation: !!station,
      isHalt: false,
    };
}

