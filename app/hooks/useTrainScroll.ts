import { useMemo } from 'react';
import { calculateScrollParams, type ScrollParams } from '../utils/train-scroll-calculator';
import { getPathTotalLength, TRACK_CONFIG } from '../utils/circular-rotator-utils';

export function useTrainScroll(
  stationCount: number,
  pillGap: number,
  pillsPerStation: number
): ScrollParams {
  return useMemo(() => {
    const itemCount = stationCount * pillsPerStation;
    const pathTotalLength = getPathTotalLength(TRACK_CONFIG);
    
    return calculateScrollParams({
      itemCount,
      pillGap,
      pathTotalLength,
    });
  }, [stationCount, pillGap, pillsPerStation]);
}

