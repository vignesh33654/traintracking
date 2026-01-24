import { cn } from "@/app/utils/utils";
import { StatusDot } from "./StatusDot";

export interface TrainIconProps {
  journeyDate?: string | null;
  distanceFromOriginKm?: number | null;
  showStatusDot?: boolean;
  className?: string;
}

export function TrainIcon({
  journeyDate,
  distanceFromOriginKm,
  showStatusDot = true,
  className,
}: TrainIconProps) {
  return (
    <div className={cn("relative size-[30px]", className)}>
      <div className="flex items-center justify-center size-full rounded-full border border-bg-1">
        <div
          className="size-[16px] bg-text-primary"
          style={{
            maskImage: 'url("/Train icon.svg")',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url("/Train icon.svg")',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
          aria-label="Train"
        />
      </div>
      {showStatusDot && (
        <StatusDot
          journeyDate={journeyDate}
          distanceFromOriginKm={distanceFromOriginKm}
          size="sm"
          className="absolute top-[7px] right-[7px]"
        />
      )}
    </div>
  );
}
