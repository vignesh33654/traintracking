"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTrainSearch } from "@/app/hooks/useTrainSearch";
import type { TrainSearchResult } from "@/app/types/search.types";
import { StatusDot } from "./StatusDot";

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 14L11.1 11.1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SearchTrainProps {
  onSelectTrain: (trainNumber: string) => void;
  defaultValue?: string;
  variant?: "fixed" | "inline";
}

export default function SearchTrain({ onSelectTrain, defaultValue = "", variant = "fixed" }: SearchTrainProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: results = [], isLoading } = useTrainSearch(debouncedQuery);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Open dropdown when results are available
  useEffect(() => {
    if (results.length > 0 && debouncedQuery.length >= 2) {
      setIsOpen(true);
    }
  }, [results, debouncedQuery]);

  // Close dropdown when clicking outside
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
    setInputValue(result.trainNumber);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectTrain(result.trainNumber);
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
    setInputValue(e.target.value);
    setHighlightedIndex(-1);
    if (e.target.value.length < 2) {
      setIsOpen(false);
    }
  };

  const containerClasses = variant === "fixed"
    ? "fixed top-4 right-24 z-50 max-md:hidden"
    : "relative flex-1";

  const inputContainerClasses = variant === "fixed"
    ? "flex h-[38px] w-[240px] items-center gap-1.5 rounded-[40px] border border-divider bg-bg-0 px-4 py-1 focus-within:ring-2 focus-within:ring-orange focus-within:ring-offset-2"
    : "flex h-[38px] w-full items-center gap-1.5 rounded-[40px] border border-divider bg-bg-0 px-4 py-1 focus-within:ring-2 focus-within:ring-orange focus-within:ring-offset-2";

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
          placeholder="Search by train number or name"
          className="min-w-0 flex-1 bg-transparent text-xs leading-4 text-text-primary placeholder:text-text-secondary focus:outline-none"
          aria-label="Search trains"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
      </div>

      {isOpen && (
        <div className={`absolute top-full z-50 mt-1 overflow-hidden rounded-xl bg-bg-1 p-0.5 ${variant === "fixed" ? "w-[240px]" : "w-full"}`}>
          {isLoading ? (
            <div className="px-2 py-1.5 text-xs text-text-secondary">
              Searching...
            </div>
          ) : results.length === 0 ? (
            <div className="px-2 py-1.5 text-xs text-text-secondary">
              No trains found
            </div>
          ) : (
            <ul
              role="listbox"
              className="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto"
            >
              {results.map((result, index) => (
                <li
                  key={result.trainNumber}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 ${
                    highlightedIndex === index ? "bg-bg-0" : "hover:bg-bg-0"
                  }`}
                >
                  <StatusDot
                    size="sm"
                    journeyDate={new Date().toISOString().split('T')[0]}
                    distanceFromOriginKm={1}
                  />
                  <span className="text-xs text-text-primary">
                    {result.trainNumber} - {result.sourceStationCode} to {result.destinationStationCode}
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
