import { useState, useCallback } from 'react';

export function useStationToggle() {
  const [showAllStations, setShowAllStations] = useState(false);

  const toggleStations = useCallback(() => {
    setShowAllStations((prev) => !prev);
  }, []);

  return {
    showAllStations,
    toggleStations,
  };
}

