export const TRAIN_CONFIG = {
  backgroundColor: '#00527A',
  borderRadius: 24,
  width: 24,
  overlap: -4, // Overlap between segments (px) to eliminate gaps on curves
  mask: {
    enabled: true,
    color: '#00527A',
    gapPx: 1.5, // visual gap between masked car slices
    opacity: 1,
  },
  shadow: {
    enabled: true,
    color: '#b9b9b9',
    blur: 2.5,
    width: 24,
    offsetX: 8,
    offsetY: 4,
    opacity: 1,
    borderRadius: 0,
    zIndex: 0,
  },
  headlight: {
    enabled: true,
    file: '/Trainicon/Headlight shadow.svg',
    width: 40,
    height: 140,
    offsetX: 0, // horizontal offset from engine center
    offsetY: 60, // vertical offset (positions light beam ahead of engine)
    opacity: 1,
    zIndex: 48, // below train segments
    darkModeOnly: true, // only show in dark mode
  },
  segments: [
    { file: '/Trainicon/Part 1.svg', height: 26, name: 'engine' },
    { file: '/Trainicon/Part 2.svg', height: 30, name: 'coach1' },
    { file: '/Trainicon/Part 3.svg', height: 28, name: 'coach2' },
    { file: '/Trainicon/Part 4.svg', height: 28, name: 'coach3' },
    { file: '/Trainicon/Part 5.svg', height: 27, name: 'tail' },
  ],
  totalHeight: 139,
} as const;

export type TrainSegment = (typeof TRAIN_CONFIG.segments)[number];
