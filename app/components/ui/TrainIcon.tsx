import Image from "next/image";
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
      <div className="flex items-center justify-center size-full rounded-full border border-divider">
        <Image
          src="/Train icon.svg"
          alt="Train"
          width={16}
          height={16}
          className="size-[16px]"
        />
      </div>
      {showStatusDot && (
        <StatusDot
          journeyDate={journeyDate}
          distanceFromOriginKm={distanceFromOriginKm}
          size="sm"
          className="absolute top-[7px] right-[8px]"
        />
      )}
    </div>
  );
}
