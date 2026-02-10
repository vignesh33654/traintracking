import { cn } from "@/app/utils/utils";

interface StationCodeIconProps {
  stationCode: string;
  className?: string;
}

export default function StationCodeIcon({
  stationCode,
  className,
}: StationCodeIconProps) {
  return (
    <div className={cn("relative size-6", className)}>
      <div className="absolute left-1/2 top-0.75 h-2.5 w-6 -translate-x-1/2 border border-yellow" />
      <div className="absolute left-1.25 top-3.25 h-2 w-px bg-yellow" />
      <div className="absolute right-1.25 top-3.25 h-2 w-px bg-yellow" />
      <span className="absolute left-1/2 top-pill-dot -translate-x-1/2 text-center text-[8px] uppercase text-yellow font-circular">
        {stationCode}
      </span>
    </div>
  );
}
