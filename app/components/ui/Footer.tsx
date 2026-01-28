"use client";

import { cn } from "@/app/utils/utils";

export interface FooterProps {
  trainNumber: string;
  trainName: string;
  speed?: number; // Animation speed in pixels/second (default: 30)
  className?: string;
}

export function Footer({
  trainNumber,
  trainName,
  speed = 60,
  className,
}: FooterProps) {
  // Format the text with bullet separators and spacing
  const formattedText = `${trainNumber} • ${trainName}`;
  const separator = "   •   "; // Spacing between repeats

  // Duration controls animation speed
  const duration = 1000 / speed;

  // Create text that repeats enough to fill viewport and then some
  // We duplicate the content so when it scrolls -50%, the second half looks identical
  const repeatedText = `${formattedText}${separator}${formattedText}${separator}${formattedText}${separator}${formattedText}${separator}`;

  return (
    <footer
      className={cn(
        "fixed bottom-0 left-0 right-0 w-full z-50",
        "bg-bg-0",
        className
      )}
    >
      <div className="marquee-container p-[8px]">
        <div
          className="marquee-content font-doto font-bold uppercase text-[14px] text-text-primary tracking-[-0.56px]"
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {/* Duplicate the repeated text for seamless loop */}
          <span className="inline-block">{repeatedText}</span>
          <span className="inline-block">{repeatedText}</span>
        </div>
      </div>
    </footer>
  );
}
