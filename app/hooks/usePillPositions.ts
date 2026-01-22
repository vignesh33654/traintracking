"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { calculatePillPosition } from "../utils/circular-rotator-calculations";
import { getTooltipDirection, TOOLTIP_OFFSETS } from "../utils/pillTooltip";

interface UsePillPositionsParams {
  gapRatio: number;
  scrollRange: number;
  scrollProgress: number;
}

export function usePillPositions({ gapRatio, scrollRange, scrollProgress }: UsePillPositionsParams) {
  const pillRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const latestScrollProgress = useRef(0);
  const scheduleUpdateRef = useRef<() => void>(() => {});

  useEffect(() => {
    latestScrollProgress.current = scrollProgress;
    scheduleUpdateRef.current();
  }, [scrollProgress]);

  useLayoutEffect(() => {
    let frameId: number | null = null;

    const applyPositions = () => {
      frameId = null;
      const progress = latestScrollProgress.current;

      pillRefs.current.forEach((element, index) => {
        if (!element) return;

        const { x, y, rotation, isVisible } = calculatePillPosition(
          index,
          progress,
          gapRatio,
          scrollRange
        );

        element.style.setProperty("--pill-x", `${x}px`);
        element.style.setProperty("--pill-y", `${y}px`);
        element.style.setProperty("--pill-rotation", `${rotation}deg`);
        element.style.setProperty("--pill-rotation-inverse", `${-rotation}deg`);
        element.style.setProperty("--pill-opacity", isVisible ? "1" : "0");

        const tooltip = element.querySelector<HTMLElement>("[data-station-tooltip]");
        if (tooltip) {
          const direction = getTooltipDirection(x);
          const offset = TOOLTIP_OFFSETS[direction];
          tooltip.style.setProperty("--tooltip-offset-x", `${offset.x}px`);
          tooltip.style.setProperty("--tooltip-offset-y", `${offset.y}px`);
          tooltip.style.setProperty("--tooltip-translate-x", direction === "left" ? "-100%" : "0%");
          tooltip.style.setProperty(
            "--tooltip-origin",
            direction === "left" ? "right center" : "left center"
          );

          const orientation =
            direction === "left"
              ? {
                  flexDirection: "row-reverse",
                  contentAlign: "flex-end",
                  textAlign: "right",
                  rowJustify: "flex-end",
                  arrowRotation: "180deg",
                }
              : {
                  flexDirection: "row",
                  contentAlign: "flex-start",
                  textAlign: "left",
                  rowJustify: "flex-start",
                  arrowRotation: "0deg",
                };

          tooltip.style.setProperty("--tooltip-flex-direction", orientation.flexDirection);
          tooltip.style.setProperty("--tooltip-content-align", orientation.contentAlign);
          tooltip.style.setProperty("--tooltip-text-align", orientation.textAlign);
          tooltip.style.setProperty("--tooltip-row-justify", orientation.rowJustify);
          tooltip.style.setProperty("--tooltip-arrow-rotation", orientation.arrowRotation);
        }
      });
    };

    const scheduleUpdate = () => {
      if (frameId !== null) return;
      frameId = requestAnimationFrame(applyPositions);
    };

    scheduleUpdateRef.current = scheduleUpdate;
    scheduleUpdate();

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      scheduleUpdateRef.current = () => {};
    };
  }, [gapRatio, scrollRange]);

  return useCallback((index: number, node: HTMLDivElement | null) => {
    if (node) {
      pillRefs.current.set(index, node);
    } else {
      pillRefs.current.delete(index);
    }
    scheduleUpdateRef.current();
  }, []);
}
