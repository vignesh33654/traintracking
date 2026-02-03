import { useState, useRef, useEffect, useMemo } from "react";
import { useTrainSearch } from "@/app/providers/SearchQueryProvider";
import { cleanTrainName, saveStoredTrain } from "./cleantrainname-utils";
import type { TrainSearchResult } from "./types";

// Filter out invalid trains (special, poster, memu, toy, etc.)
const filterInvalidTrains = (trains: TrainSearchResult[]) => {
  const invalidPatterns = ['SPL', 'SPECIAL', 'POSTER', 'MEMU', 'TOY'];
  return trains.filter(train => {
    const name = train.trainName.toUpperCase();
    if (invalidPatterns.some(pattern => name.includes(pattern))) {
      return false;
    }
    if (train.trainNumber.startsWith('0')) {
      return false;
    }
    return true;
  });
};

// Sort trains - prefix matches first
const sortByRelevance = (trains: TrainSearchResult[], query: string) => {
  return [...trains].sort((a, b) => {
    const aStartsWith = a.trainNumber.startsWith(query);
    const bStartsWith = b.trainNumber.startsWith(query);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });
};

interface UseSearchTrainLogicProps {
  defaultValue?: string;
  onSelectTrain: (trainNumber: string) => void;
}

export function useSearchTrainLogic({ defaultValue = "", onSelectTrain }: UseSearchTrainLogicProps) {
  const [userInputValue, setUserInputValue] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: rawResults = [], isLoading } = useTrainSearch(debouncedQuery);

  // Filter and sort results
  const results = useMemo(() => {
    const filtered = filterInvalidTrains(rawResults);
    return debouncedQuery ? sortByRelevance(filtered, debouncedQuery) : filtered;
  }, [rawResults, debouncedQuery]);

  const { data: defaultTrainData } = useTrainSearch(defaultValue, {
    enabled: !!defaultValue && defaultValue.length >= 2
  });

  // Derive input value: user input takes precedence, otherwise show default train data
  const inputValue = useMemo(() => {
    if (userInputValue !== null) {
      return userInputValue;
    }
    if (defaultTrainData && defaultTrainData.length > 0) {
      const train = defaultTrainData[0];
      return `${train.trainNumber} - ${cleanTrainName(train.trainName)}`;
    }
    return defaultValue;
  }, [userInputValue, defaultTrainData, defaultValue]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: TrainSearchResult) => {
    setUserInputValue(`${result.trainNumber} - ${cleanTrainName(result.trainName)}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectTrain(result.trainNumber);
    saveStoredTrain(result.trainNumber);
  };

  const handleClear = () => {
    setUserInputValue("");
    setDebouncedQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUserInputValue(newValue);
    setHighlightedIndex(-1);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounced query with timeout
    if (newValue.length >= 2) {
      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(newValue);
        setIsOpen(true);
      }, 300);
    } else {
      setIsOpen(false);
      setDebouncedQuery("");
    }
  };

  const handleFocus = () => {
    if (results.length > 0 && debouncedQuery.length >= 2) {
      setIsOpen(true);
    }
  };

  return {
    inputValue,
    isOpen,
    highlightedIndex,
    results,
    isLoading,
    debouncedQuery,
    containerRef,
    inputRef,
    listboxRef,
    handleSelect,
    handleKeyDown,
    handleInputChange,
    handleFocus,
    handleClear,
    setHighlightedIndex,
  };
}
