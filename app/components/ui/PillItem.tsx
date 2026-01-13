interface PillItemProps {
  className?: string;
}

export default function PillItem({ className = "" }: PillItemProps) {
  return (
    <div className={`w-pill-width h-pill-height bg-bg-1 rounded-full relative ${className}`}>
      <div className="absolute left-0.5 top-0.5 size-pill-dot rounded-full bg-text-secondary" />
      <div className="absolute right-0.5 top-0.5 size-pill-dot rounded-full bg-text-secondary" />
    </div>
  );
}

