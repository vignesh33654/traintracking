import { cn } from "../../utils/utils";

interface PillItemProps {
  className?: string;
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
}: PillItemProps) {
  return (
    <div
      className={cn(
        "relative h-pill-height w-pill-width rounded-full bg-bg-1 z-10",
        className
      )}
    >
      <PillDot position="left" />
      <PillDot position="right" />
    </div>
  );
}
