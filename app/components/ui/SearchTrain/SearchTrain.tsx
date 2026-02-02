"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTrainSearch } from "@/app/hooks/useTrainSearch";
import { SearchIcon } from "./SearchIcon";
import { cleanTrainName, saveStoredTrain } from "./utils";
import type { SearchTrainProps, TrainSearchResult } from "./types";

const LISTBOX_ID = "train-search-listbox";

export default function SearchTrain({ onSelectTrain, defaultValue = "", variant = "fixed" }: SearchTrainProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const hasUserTyped = useRef(false);

  const { data: results = [], isLoading } = useTrainSearch(debouncedQuery);

  const { data: defaultTrainData } = useTrainSearch(defaultValue, {
    enabled: !!defaultValue && defaultValue.length >= 2
  });

  // Update input value when defaultTrainData loads
  useEffect(() => {
    if (defaultTrainData && defaultTrainData.length > 0 && !hasUserTyped.current) {
      const train = defaultTrainData[0];
      setInputValue(`${train.trainNumber} - ${cleanTrainName(train.trainName)}`);
    }
  }, [defaultTrainData]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (hasUserTyped.current && results.length > 0 && debouncedQuery.length >= 2) {
      setIsOpen(true);
    }
  }, [results, debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = useCallback((result: TrainSearchResult) => {
    setInputValue(`${result.trainNumber} - ${cleanTrainName(result.trainName)}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectTrain(result.trainNumber);
    saveStoredTrain(result.trainNumber);
  }, [onSelectTrain]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, results, highlightedIndex, handleSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasUserTyped.current = true;
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);
    if (newValue.length < 2) {
      setIsOpen(false);
    }
  };

  const containerClasses = variant === "fixed"
    ? "fixed top-4 right-26 z-50 max-md:hidden"
    : "relative flex-1";

  const inputContainerClasses = variant === "fixed"
    ? "flex h-[46px] w-[240px] items-center gap-1.5 rounded-[40px] border border-divider bg-bg-0 px-4 py-1 focus-within:border-orange"
    : "flex h-[38px] w-full items-center gap-1.5 rounded-[40px] border border-divider bg-bg-0 px-4 py-1 focus-within:border-orange";

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
          onFocus={() => {
            if (results.length > 0 && debouncedQuery.length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder="Train number or name"
          className="min-w-0 flex-1 bg-transparent font-b612-mono-10 text-text-primary placeholder:text-text-secondary focus:outline-none  overflow-hidden"
          style={{ WebkitUserSelect: "text" }}
          aria-label="Search trains"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={isOpen ? LISTBOX_ID : undefined}
          aria-activedescendant={highlightedIndex >= 0 ? `train-option-${results[highlightedIndex]?.trainNumber}` : undefined}
          role="combobox"
        />
      </div>

      {isOpen && (
        <div className={`absolute top-top z-50 mt-1 overflow-hidden rounded-xl bg-bg-1 p-1 ${variant === "fixed" ? "w-[320px]" : "w-full"}`}>
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
              className="flex max-h-[240px] flex-col gap-0.5 overflow-y-auto"
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
                    {cleanTrainName(result.trainName)}
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
