import { cn } from "../../utils/utils";

interface PillItemProps {
  className?: string;
  stationName?: string;
}

export default function PillItem({ className, stationName }: PillItemProps) {
  return (
    <div className={cn("group w-pill-width h-pill-height bg-bg-1 rounded-full relative", className)}>
      <div className="absolute left-0.5 top-0.5 size-pill-dot rounded-full bg-text-secondary" />
      <div className="absolute right-0.5 top-0.5 size-pill-dot rounded-full bg-text-secondary" />
      {stationName ? (
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 px-2 py-0.5 rounded-full bg-bg-1 text-text-secondary text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {stationName}
        </div>
      ) : null}
    </div>
  );
}
