"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getTodayDate } from "@/app/utils/todaydate";

interface JourneyDateDropdownProps {
  value: string;
  onChange: (date: string) => void;
  variant?: "fixed" | "inline";
}

interface DateOption {
  value: string;
  label: string;
}

function generateDateOptions(): DateOption[] {
  const options: DateOption[] = [];
  const today = new Date();

  // Yesterday, Today, Tomorrow, and next 2 days (total 5 days)
  for (let i = -1; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const value =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0");

    let label: string;
    if (i === -1) {
      label = "Yesterday";
    } else if (i === 0) {
      label = "Today";
    } else if (i === 1) {
      label = "Tomorrow";
    } else {
      // Format: "Wed, 7 Feb"
      label = date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }

    options.push({ value, label });
  }

  return options;
}

function CalendarIcon() {
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
        d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`transition-none ${isOpen ? "rotate-180" : ""}`}
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function JourneyDateDropdown({
  value,
  onChange,
  variant = "fixed",
}: JourneyDateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const dateOptions = generateDateOptions();
  const todayDate = getTodayDate();

  const selectedOption = dateOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label ?? "Select Date";

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const highlightedElement = listboxRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      highlightedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback(
    (option: DateOption) => {
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
      buttonRef.current?.focus();
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            handleSelect(dateOptions[highlightedIndex]);
          } else {
            setIsOpen(true);
            setHighlightedIndex(
              dateOptions.findIndex((opt) => opt.value === value),
            );
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              dateOptions.findIndex((opt) => opt.value === value),
            );
          } else {
            setHighlightedIndex((prev) =>
              prev < dateOptions.length - 1 ? prev + 1 : 0,
            );
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(
              dateOptions.findIndex((opt) => opt.value === value),
            );
          } else {
            setHighlightedIndex((prev) =>
              prev > 0 ? prev - 1 : dateOptions.length - 1,
            );
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          buttonRef.current?.focus();
          break;
        case "Tab":
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, highlightedIndex, dateOptions, value, handleSelect],
  );

  const containerClasses =
    variant === "fixed"
      ? "relative"
      : "relative";

  const buttonClasses =
    variant === "fixed"
      ? "flex h-[46px] w-[152px] items-center gap-2 rounded-[40px] border border-divider bg-bg-0 px-4 py-1 focus:outline-none transition-none hover:cursor-pointer"
      : "flex h-[44px] items-center gap-2 rounded-[40px] border border-divider bg-bg-0 px-3 py-1 hover:border-orange focus:outline-none transition-none";

  const LISTBOX_ID = "journey-date-listbox";

  return (
    <div ref={containerRef} className={containerClasses}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={buttonClasses}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? LISTBOX_ID : undefined}
        aria-label={`Journey date: ${displayLabel}`}
      >
        <span className="shrink-0 text-text-secondary">
          <CalendarIcon />
        </span>
        <span className={`font-b612-mono-11 font-b612-mobile-responsive text-text-primary ${variant === "inline" ? "hidden" : ""}`}>
          {displayLabel}
        </span>
        <span className="shrink-0 text-text-secondary ml-auto">
          <ChevronIcon isOpen={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute w-[152] top-full z-50 mt-1 overflow-hidden rounded-xl bg-bg-1 p-1 ${
            variant === "fixed" ? "min-w-35" : "min-w-30"
          }`}
        >
          <ul
            ref={listboxRef}
            id={LISTBOX_ID}
            role="listbox"
            aria-label="Journey date options"
            className="flex flex-col gap-0.5"
          >
            {dateOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isToday = option.value === todayDate;

              return (
                <li
                  key={option.value}
                  id={`date-option-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 ${
                    highlightedIndex === index ? "bg-bg-0" : "hover:bg-bg-0"
                  }`}
                >
                  <span
                    className={`font-b612-mono-11 ${
                      isSelected ? "text-orange" : "text-text-primary"
                    }`}
                  >
                    {option.label}
                  </span>
                  {isToday && !isSelected && (
                    <span className="ml-2 h-1.5 w-1.5 rounded-full bg-orange" />
                  )}
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-orange"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
