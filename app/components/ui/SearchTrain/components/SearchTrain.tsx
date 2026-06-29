"use client";

import { useCallback, useState } from "react";
import { SearchIcon, CrossIcon } from "../../../../../public/Icons";
import { useSearchTrainLogic } from "../hooks/useSearchTrainLogic";
import { useSearchTrainUI } from "../hooks/useSearchTrainUI";
import type { SearchTrainProps } from "../types/types";

const LISTBOX_ID = "train-search-listbox";
const FOCUS_SCROLL_RESTORE_DELAYS_MS = [0, 50, 150, 300];

export default function SearchTrain({
  onSelectTrain,
  defaultValue = "",
  variant = "fixed",
}: SearchTrainProps) {
  const [userQuery, setUserQuery] = useState("");
  const { results, isLoading } = useSearchTrainLogic({ query: userQuery });

  const {
    inputValue,
    isOpen,
    highlightedIndex,
    containerRef,
    inputRef,
    listboxRef,
    handleSelect,
    handleKeyDown,
    handleInputChange: handleUIInputChange,
    handleFocus,
    handleClear,
    setHighlightedIndex,
  } = useSearchTrainUI({ defaultValue, onSelectTrain, results });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserQuery(e.target.value);
    handleUIInputChange(e);
  };

  const restoreScrollPositionAfterFocus = useCallback(() => {
    const scrollY = window.scrollY;
    const restoreScroll = () => window.scrollTo(0, scrollY);

    requestAnimationFrame(restoreScroll);
    FOCUS_SCROLL_RESTORE_DELAYS_MS.forEach((delay) => {
      window.setTimeout(restoreScroll, delay);
    });
  }, []);

  const handleInputPointerDown = useCallback(
    (event: React.PointerEvent<HTMLInputElement>) => {
      if (event.pointerType !== "touch") return;

      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });
      restoreScrollPositionAfterFocus();
    },
    [restoreScrollPositionAfterFocus],
  );

  const showClearIcon = inputValue && inputValue.length > 0;

  const containerClasses =
    variant === "fixed" ? "relative" : "relative flex-1 min-w-0";

  const inputContainerClasses =
    variant === "fixed"
      ? "flex h-11.5 w-60 items-center gap-1.5 rounded-full border border-divider bg-bg-0 px-4 py-1 focus-within:border-orange"
      : "flex h-11 w-full items-center gap-1.5 rounded-full border border-divider bg-bg-0 px-4 py-1 focus-within:border-orange";

  return (
    <div ref={containerRef} className={containerClasses}>
      <div className={inputContainerClasses}>
        <span className="shrink-0 text-text-secondary">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onPointerDown={handleInputPointerDown}
          placeholder="TRAIN NO OR NAME"
          className="safari-focus-safe-input min-w-0 flex-1 bg-transparent font-b612-mono-11 font-b612-mobile-responsive text-text-primary placeholder:text-text-secondary focus:outline-none overflow-hidden"
          style={{ WebkitUserSelect: "text" }}
          aria-label="Search trains"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? LISTBOX_ID : undefined}
          aria-activedescendant={
            highlightedIndex >= 0
              ? `train-option-${results[highlightedIndex]?.trainNumber}`
              : undefined
          }
          role="combobox"
        />
        {showClearIcon && (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 text-text-secondary hover:text-text-primary cursor-pointer"
            aria-label="Clear search"
          >
            <CrossIcon />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className={`absolute top-top z-50 mt-1 overflow-hidden rounded-xl bg-bg-1 p-1 ${variant === "fixed" ? "w-60" : "w-full"}`}
        >
          {isLoading ? (
            <div className="px-2 py-1.5 text-label text-text-secondary">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-2 py-1.5 text-label text-text-secondary">
              No trains found
            </div>
          ) : (
            <ul
              ref={listboxRef}
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Search results"
              className="flex max-h-60 flex-col gap-0.5 overflow-y-auto"
            >
              {results.map((result, index) => (
                <li
                  id={`train-option-${result.trainNumber}`}
                  key={result.trainNumber}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-center rounded-lg px-2 py-1.5 ${
                    highlightedIndex === index ? "bg-bg-0" : "hover:bg-bg-0"
                  }`}
                >
                  <span className="font-b612-mono-11 text-text-primary shrink-0">
                    {result.trainNumber}
                  </span>
                  <span className="font-b612-mono-11 text-text-secondary shrink-0 px-1">
                    -
                  </span>
                  <span className="font-b612-mono-11 text-text-primary truncate">
                    {result.trainName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
