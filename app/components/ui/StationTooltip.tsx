import Image from "next/image";
import { cn } from "../../utils/utils";

type Direction = "left" | "right" | "bottom";

const DIRECTION_STYLES = {
  left: {
    container: "flex-row-reverse",
    content: "items-end",
    text: "text-right",
    row: "justify-end",
    arrow: "rotate-180",
  },
  right: {
    container: "flex-row",
    content: "items-start",
    text: "text-left",
    row: "justify-start",
    arrow: "",
  },
  bottom: {
    container: "flex-col",
    content: "items-center",
    text: "text-center",
    row: "justify-center",
    arrow: "rotate-90 self-center w-[39px] h-[39px]",
  },
} as const;

const ICON_SIZE = 14;
const ARROW_WIDTH = 39;
const ARROW_HEIGHT = 6;

interface StationTooltipProps {
  stationName: string;
  scheduledDeparture: string;
  platform: string;
  direction: Direction;
  day: number;
  className?: string;
}

function TooltipArrow({ direction }: { direction: Direction }) {
  return (
    <Image
      src="/tooltip arrow.svg"
      alt=""
      width={ARROW_WIDTH}
      height={ARROW_HEIGHT}
      className={cn("shrink-0", DIRECTION_STYLES[direction].arrow)}
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
      <span className="font-b612-mono-10 leading-[14px] text-text-secondary uppercase whitespace-nowrap ">
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
  const styles = DIRECTION_STYLES[direction];

  return (
    <div
      className={cn(
        "flex items-center gap-pill-height max-w-[210px]",
        styles.container,
        className
      )}
      role="tooltip"
      aria-label={`${stationName}, departure ${scheduledDeparture}, platform ${platform}`}
    >
      <TooltipArrow direction={direction} />

      <div className={cn("flex flex-col  gap-pill-dot", styles.content)}>
        <p
          className={cn(
            "font-b612-mono-10 leading-[14px] text-text-primary uppercase w-full",
            styles.text
          )}
        >
          {stationName}
        </p>
        <div className={cn("flex gap-[4px] items-center", styles.row)}>
        <InfoItem icon="/placeholder.svg" label={`DAY:${day}`} />
          <InfoItem icon="/placeholder.svg" label={`DEP:${scheduledDeparture}`} />
          <InfoItem icon="/platform.svg" label={`P-${platform}`} />
        </div>
      </div>
    </div>
  );
}
