import { cn } from "@/app/utils/utils";

interface DistanceKmProps {
  distanceFromOriginKm: number;
  className?: string;
}

export function DistanceKm({ distanceFromOriginKm, className }: DistanceKmProps) {
  return (
    <div className={cn("relative w-6 h-5", className)}>
      {/* Top curved */}
      <div className="absolute left-1/2 top-1 -translate-x-1/2 w-4 h-2 border border-text-secondary rounded-t-[10px]" />

      {/* Bottom rectangle */}
      <div className="absolute left-1 top-2.75 w-4 h-3 border border-text-secondary" />

      {/* Distance text */}
      <p className="absolute left-1/2 top-1.25 -translate-x-1/2 w-6 text-center text-[8px] text-text-secondary font-circular">
        {distanceFromOriginKm}
      </p>
    </div>
  );
}
