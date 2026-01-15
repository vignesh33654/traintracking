import Image from "next/image";
import { cn } from "../../utils/utils";

interface PillItemProps {
  className?: string;
  stationName?: string;
  isActualStation?: boolean;
  rotation?: number;
}

function PillDot({ position }: { position: 'left' | 'right' }) {
  return (
    <div
      className={cn(
        "absolute top-0.5 size-pill-dot rounded-full bg-text-secondary",
        position === 'left' ? "left-0.5" : "right-0.5"
      )}
    />
  );
}

export default function PillItem({
  className,
  stationName,
  isActualStation = false,
  rotation = 0,
}: PillItemProps) {
  return (
    <div
      className={cn(
        "group relative h-pill-height w-pill-width rounded-full transition-all bg-bg-1",
        isActualStation && "cursor-pointer",
        className
      )}
    >
      <PillDot position="left" />
      <PillDot position="right" />

      {isActualStation && (
        <div
          className="absolute left-1.5 top-2"
          style={{
            transform: `translate(-50%, -50%)) rotate(${rotation}deg)`,
            transformOrigin: "center",
            width: "24px",
            height: "24px",
          }}
        >
          <Image
            src="/platform.svg"
            alt="Platform"
            width={24}
            height={24}
          />
        </div>
      )}

      {isActualStation && stationName && (
        <div className="pointer-events-none absolute left-1/2 -top-8 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-bg-1 px-2 py-0.5 text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100">
          {stationName}
        </div>
      )}
    </div>
  );
}
