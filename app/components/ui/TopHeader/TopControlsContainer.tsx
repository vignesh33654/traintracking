"use client";

import SearchTrain from "../SearchTrain";
import JourneyDateDropdown from "./JourneyDateDropdown";
import DarkModeToggle from "./DarkModeToggle";

interface TopControlsContainerProps {
  journeyDate: string;
  onJourneyDateChange: (date: string) => void;
  onSelectTrain: (trainNumber: string) => void;
  defaultTrainValue?: string;
  variant?: "fixed" | "inline";
}

export default function TopControlsContainer({
  journeyDate,
  onJourneyDateChange,
  onSelectTrain,
  defaultTrainValue = "",
  variant = "fixed",
}: TopControlsContainerProps) {
  const containerClasses =
    variant === "fixed"
      ? "fixed top-4 left-4 right-4 z-50 max-md:hidden flex items-center justify-between gap-1"
      : "flex items-center gap-1 w-full min-w-0";

  return (
    <div className={containerClasses}>
      {variant === "fixed" ? (
        <>
          <div className="flex items-center gap-1">
            <SearchTrain
              onSelectTrain={onSelectTrain}
              defaultValue={defaultTrainValue}
              variant={variant}
            />
            <JourneyDateDropdown
              value={journeyDate}
              onChange={onJourneyDateChange}
              variant={variant}
            />
          </div>
          <DarkModeToggle variant={variant} />
        </>
      ) : (
        <>
          <SearchTrain
            onSelectTrain={onSelectTrain}
            defaultValue={defaultTrainValue}
            variant={variant}
          />
          <JourneyDateDropdown
            value={journeyDate}
            onChange={onJourneyDateChange}
            variant={variant}
          />
          <DarkModeToggle variant={variant} />
        </>
      )}
    </div>
  );
}
