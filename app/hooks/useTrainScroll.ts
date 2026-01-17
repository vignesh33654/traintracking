import { useMemo } from 'react';
import { calculateScrollParams, type ScrollParams } from '../utils/train-scroll-calculator';
import { getPathTotalLength } from '../utils/circular-rotator-utils';

export function useTrainScroll(
  stationCount: number,
  pillGap: number,
  pillsPerStation: number
): ScrollParams {
  return useMemo(() => {
    const itemCount = stationCount * pillsPerStation;
    const pathTotalLength = getPathTotalLength();

    return calculateScrollParams({
      itemCount,
      pillGap,
      pathTotalLength,
    });
  }, [stationCount, pillGap, pillsPerStation]);
}

