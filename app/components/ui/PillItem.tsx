import { cn } from "../../utils/utils";

interface PillItemProps {
  className?: string;
  stationName?: string;
  isActualStation?: boolean;
  isHalt?: boolean;
  onDoubleClick?: () => void;
}

function PillDot({ isHalt, position }: { isHalt: boolean; position: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        "absolute top-0.5 size-pill-dot rounded-full",
        position === 'left' ? "left-0.5" : "right-0.5",
        isHalt ? "bg-text-secondary" : "bg-text-secondary/50"
      )}
    />
  );
}

export default function PillItem({
  className,
  stationName,
  isActualStation = false,
  isHalt = true,
  onDoubleClick,
}: PillItemProps) {
  return (
    <div
      className={cn(
        "group relative h-pill-height w-pill-width rounded-full transition-all",
        isHalt ? "bg-bg-1" : "bg-bg-1/50",
        isActualStation && "cursor-pointer hover:scale-110",
        className
      )}
      onDoubleClick={isActualStation ? onDoubleClick : undefined}
    >
      <PillDot isHalt={isHalt} position="left" />
      <PillDot isHalt={isHalt} position="right" />

      {isActualStation && stationName && (
        <div className="pointer-events-none absolute left-1/2 -top-6 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-bg-1 px-2 py-0.5 text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
          {stationName}
        </div>
      )}
    </div>
  );
}
