import { useState, useRef, useEffect, useMemo, RefObject } from "react";
import { saveStoredTrain } from "../store";
import type { TrainSearchResult } from "../types/types";

interface UseSearchTrainUIProps {
  defaultValue?: string;
  onSelectTrain: (trainNumber: string) => void;
  results: TrainSearchResult[];
}

interface UseSearchTrainUIReturn {
  inputValue: string;
  isOpen: boolean;
  highlightedIndex: number;
  containerRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  listboxRef: RefObject<HTMLUListElement | null>;
  handleSelect: (result: TrainSearchResult) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus: () => void;
  handleClear: () => void;
  setHighlightedIndex: (index: number) => void;
}

export function useSearchTrainUI({
  defaultValue = "",
  onSelectTrain,
  results,
}: UseSearchTrainUIProps): UseSearchTrainUIReturn {
  const [userInputValue, setUserInputValue] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Derive input value: user input takes precedence, otherwise show default value
  const inputValue = useMemo(() => {
    if (userInputValue !== null) {
      return userInputValue;
    }
    return defaultValue;
  }, [userInputValue, defaultValue]);

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
    const label = `${result.trainNumber} - ${result.trainName}`;
    setUserInputValue(label);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelectTrain(result.trainNumber);
    saveStoredTrain(result.trainNumber, label);
  };

  const handleClear = () => {
    setUserInputValue("");
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

    // Open dropdown only after 3+ characters to avoid "No trains found" for short queries
    if (newValue.length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleFocus = () => {
    if (results.length > 0 && userInputValue && userInputValue.length >= 3) {
      setIsOpen(true);
    }
  };

  return {
    inputValue,
    isOpen,
    highlightedIndex,
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
