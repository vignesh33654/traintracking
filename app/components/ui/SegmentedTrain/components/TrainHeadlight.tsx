import { useRef, useEffect } from "react";
import Image from "next/image";
import { TRAIN_CONFIG } from "../../../../config/train.config";
import type { ProgressState } from "../../../../utils/train-progress-utils";
import type { SegmentPosition } from "../types/types";

const BLINK_CLASS = "animate-headlight-blink";

interface TrainHeadlightProps {
  enginePosition: SegmentPosition;
  isDark: boolean;
  progressState: ProgressState;
}

/**
 * Renders the headlight beam (dark mode only) that rotates with train direction
 */
export function TrainHeadlight({
  enginePosition,
  isDark,
  progressState,
}: TrainHeadlightProps) {
  const { headlight } = TRAIN_CONFIG;
  const blinkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHonk = () => {
      const el = blinkRef.current;
      if (!el) return;
      el.classList.remove(BLINK_CLASS);
      void el.offsetWidth;
      el.classList.add(BLINK_CLASS);
      el.addEventListener(
        "animationend",
        () => el.classList.remove(BLINK_CLASS),
        { once: true },
      );
    };

    window.addEventListener("horn-honk", handleHonk);
    return () => window.removeEventListener("horn-honk", handleHonk);
  }, []);

  if (!headlight?.enabled) {
    return null;
  }

  if (headlight.darkModeOnly && !isDark) {
    return null;
  }

  if (progressState !== "in-progress") {
    return null;
  }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${enginePosition.x}px, ${enginePosition.y}px) translate(-50%, -50%) rotate(${enginePosition.rotation - 180}deg) translateY(${headlight.offsetY}px)`,
        width: headlight.width,
        height: headlight.height,
        zIndex: headlight.zIndex,
        opacity: headlight.opacity,
      }}
    >
      <div ref={blinkRef} style={{ transformOrigin: "bottom center" }}>
        <Image
          src={headlight.file}
          alt=""
          width={headlight.width}
          height={headlight.height}
          priority
          className="pointer-events-none"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
    </div>
  );
}
