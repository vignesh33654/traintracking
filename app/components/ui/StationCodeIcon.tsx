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
    <div className={cn("relative size-[24px]", className)}>
      <div className="absolute left-1/2 top-[3px] h-[10px] w-[24px] -translate-x-1/2 border border-yellow" />
      <div className="absolute left-[5px] top-[13px] h-[8px] w-px bg-yellow" />
      <div className="absolute right-[5px] top-[13px] h-[8px] w-px bg-yellow" />
      <span className="absolute left-1/2 top-pill-dot -translate-x-1/2 text-center text-[8px] uppercase text-yellow font-circular">
        {stationCode}
      </span>
    </div>
  );
}
