import { useState, useRef, useEffect, useMemo } from "react";
import { useTrainSearch } from "@/app/hooks/useTrainSearch";
import { cleanTrainName, saveStoredTrain } from "./cleantrainname-utils";
import type { TrainSearchResult } from "./types";

interface UseSearchTrainLogicProps {
  defaultValue?: string;
  onSelectTrain: (trainNumber: string) => void;
}

export function useSearchTrainLogic({ defaultValue = "", onSelectTrain }: UseSearchTrainLogicProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const hasUserTyped = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { data: results = [], isLoading } = useTrainSearch(debouncedQuery);

  const { data: defaultTrainData } = useTrainSearch(defaultValue, {
    enabled: !!defaultValue && defaultValue.length >= 2
  });

  // Initialize input value from defaultTrainData only once
  const initializedValue = useMemo(() => {
    if (defaultTrainData && defaultTrainData.length > 0 && !hasUserTyped.current) {
      const train = defaultTrainData[0];
      return `${train.trainNumber} - ${cleanTrainName(train.trainName)}`;
    }
    return inputValue;
  }, [defaultTrainData, inputValue]);

  // Update input value only when initialized value changes and user hasn't typed
  useEffect(() => {
    if (!hasUserTyped.current && initializedValue !== inputValue) {
      setInputValue(initializedValue);
    }
  }, [initializedValue, inputValue]);

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
    setInputValue(`${result.trainNumber} - ${cleanTrainName(result.trainName)}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectTrain(result.trainNumber);
    saveStoredTrain(result.trainNumber);
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
    hasUserTyped.current = true;
    const newValue = e.target.value;
    setInputValue(newValue);
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
      }, 800);
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
    setHighlightedIndex,
  };
}
