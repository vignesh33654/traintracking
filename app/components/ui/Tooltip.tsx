import { cva } from "class-variance-authority";
import { cn } from "../../utils/utils";

export const TOOLTIP_TIMING = {
  SHOW_DELAY_MS: 50,
  VISIBLE_DURATION_MS: 2600,
} as const;

const tooltipVariants = cva("flex items-center", {
  variants: {
    variant: {
      right: "flex-row-reverse",
      left: "flex-row",
      top: "flex-col",
      bottom: "flex-col-reverse",
    },
  },
});

const textVariants = cva(
  "bg-orange text-white font-b612-mono-10 leading-[14px] p-1 max-w-[130px] w-fit line-clamp-3",
  {
    variants: {
      variant: {
        right: "text-right",
        left: "text-left",
        top: "text-left",
        bottom: "text-left",
      },
    },
  }
);

type ArrowDirection = "right" | "left" | "top" | "bottom";

const ARROW_ROTATION: Record<ArrowDirection, string> = {
  right: "rotate(0deg)",
  left: "rotate(180deg)",
  top: "rotate(0deg)",
  bottom: "rotate(180deg)",
};

function TooltipArrow({ direction }: { direction: ArrowDirection }) {
  const isHorizontal = direction === "left" || direction === "right";

  return (
    <svg
      width={isHorizontal ? 9 : 11}
      height={isHorizontal ? 11 : 7}
      viewBox={isHorizontal ? "0 0 9 11" : "0 0 11 7"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0 text-orange"
      style={{ transform: ARROW_ROTATION[direction] }}
    >
      {isHorizontal ? (
        <path d="M9 5.5L0 0V11L9 5.5Z" fill="currentColor" />
      ) : (
        <path d="M5.5 0L0 7H11L5.5 0Z" fill="currentColor" />
      )}
    </svg>
  );
}

interface TooltipProps {
  label: string;
  variant: "right" | "left" | "top" | "bottom";
  className?: string;
}

export default function Tooltip({ label, variant, className }: TooltipProps) {
  return (
    <div
      className={cn(tooltipVariants({ variant }), className)}
      role="tooltip"
      aria-label={label}
    >
      <TooltipArrow direction={variant} />
      <span
        className={textVariants({ variant })}
        style={{ fontSize: "8px" }}
      >
        {label}
      </span>
    </div>
  );
}

export { tooltipVariants, textVariants, type TooltipProps };
