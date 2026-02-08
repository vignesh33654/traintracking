import Image from "next/image";
import { memo } from "react";
import type { CSSProperties } from "react";
import type { TrainSegmentProps } from "../types/types";

export const TrainSegment = memo(function TrainSegment({ file, width, height, x, y, rotation }: TrainSegmentProps) {
  // The SVG train parts have nose pointing DOWN by default (0° = down)
  // The path rotation: left rail = 180° (down), right rail = 0° (up)
  // So we need to adjust: when path says 180° (down), train should show nose down (0°)
  // When path says 0° (up), train should show nose up (180° flip)
  // Adjustment: subtract 180° from path rotation
  const adjustedRotation = rotation - 180;

  const style: CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${adjustedRotation}deg)`,
    width,
    height,
    zIndex: 51,
  };

  return (
    <div style={style}>
      <Image
        src={file}
        alt=""
        width={width}
        height={height}
        priority
        className="pointer-events-none"
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  );
});
