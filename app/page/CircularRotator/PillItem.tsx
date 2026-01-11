interface PillItemProps {
  className?: string;
}

export default function PillItem({ className = "" }: PillItemProps) {
  return (
    <div className={`w-[36px] h-[6px] bg-[#dbdbdb] rounded-[49px] relative ${className}`}>
      <div className="absolute left-[2px] top-[2px] size-[2px] rounded-full bg-text-default" />
      <div className="absolute right-[2px] top-[2px] size-[2px] rounded-full bg-text-default" />
    </div>
  );
}

