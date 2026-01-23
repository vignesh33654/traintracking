import Image from "next/image";
import type { CSSProperties } from "react";
import { cn } from "../../utils/utils";

type Direction = "left" | "right" | "bottom";

const DIRECTION_DEFAULTS: Record<
  Direction,
  {
    flexDirection: CSSProperties["flexDirection"];
    contentAlign: CSSProperties["alignItems"];
    textAlign: CSSProperties["textAlign"];
    rowJustify: CSSProperties["justifyContent"];
    arrowRotation: string;
    arrowClassName?: string;
  }
> = {
  left: {
    flexDirection: "row-reverse",
    contentAlign: "flex-end",
    textAlign: "right",
    rowJustify: "flex-end",
    arrowRotation: "180deg",
  },
  right: {
    flexDirection: "row",
    contentAlign: "flex-start",
    textAlign: "left",
    rowJustify: "flex-start",
    arrowRotation: "0deg",
  },
  bottom: {
    flexDirection: "column",
    contentAlign: "center",
    textAlign: "center",
    rowJustify: "center",
    arrowRotation: "90deg",
    arrowClassName: "self-center w-[39px] h-[39px]",
  },
} as const;

const ICON_SIZE = 14;
const ARROW_WIDTH = 39;
const ARROW_HEIGHT = 6;

interface StationTooltipProps {
  stationName: string;
  scheduledDeparture?: string;
  platform?: string;
  direction: Direction;
  day: number;
  className?: string;
}

function TooltipArrow({
  style,
  className,
}: {
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <Image
      src="/tooltip arrow.svg"
      alt=""
      width={ARROW_WIDTH}
      height={ARROW_HEIGHT}
      className={cn("shrink-0", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

function InfoItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex gap-pill-dot items-center">
      <Image
        src={icon}
        alt=""
        width={ICON_SIZE}
        height={ICON_SIZE}
        aria-hidden="true"
        className="shrink-0"
      />
      <span className="font-b612-mono-10 leading-[14px] text-text-secondary uppercase whitespace-nowrap text-pretty">
        {label}
      </span>
    </div>
  );
}

export default function StationTooltip({
  stationName,
  scheduledDeparture,
  platform,
  direction,
  day,
  className,
}: StationTooltipProps) {
  const defaults = DIRECTION_DEFAULTS[direction];

  const containerStyle: CSSProperties = {
    flexDirection: `var(--tooltip-flex-direction, ${defaults.flexDirection})` as CSSProperties["flexDirection"],
  };
  const contentStyle: CSSProperties = {
    alignItems: `var(--tooltip-content-align, ${defaults.contentAlign})` as CSSProperties["alignItems"],
  };
  const textStyle: CSSProperties = {
    textAlign: `var(--tooltip-text-align, ${defaults.textAlign})` as CSSProperties["textAlign"],
  };
  const rowStyle: CSSProperties = {
    justifyContent: `var(--tooltip-row-justify, ${defaults.rowJustify})` as CSSProperties["justifyContent"],
  };
  const arrowStyle: CSSProperties = {
    transform: `rotate(var(--tooltip-arrow-rotation, ${defaults.arrowRotation}))` as CSSProperties["transform"],
  };

  return (
    <div
      className={cn(
        "flex items-center gap-pill-height max-w-[210px]",
        className
      )}
      style={containerStyle}
      role="tooltip"
      aria-label={`${stationName}${scheduledDeparture ? `, departure ${scheduledDeparture}` : ""}${platform ? `, platform ${platform}` : ""}`}
    >
      <TooltipArrow style={arrowStyle} className={defaults.arrowClassName} />

      <div className="flex flex-col gap-pill-dot" style={contentStyle}>
        <p
          className="font-b612-mono-10 leading-[14px] text-text-primary uppercase w-full text-pretty"
          style={textStyle}
        >
          {stationName}
        </p>
        <div className="flex gap-1 items-center" style={rowStyle}>
          {day > 1 && <InfoItem icon="/placeholder.svg" label={`DAY:${day}`} />}
          {scheduledDeparture && <InfoItem icon="/placeholder.svg" label={`DEP:${scheduledDeparture}`} />}
          {platform && <InfoItem icon="/platform.svg" label={`P-${platform}`} />}
        </div>
      </div>
    </div>
  );
}
