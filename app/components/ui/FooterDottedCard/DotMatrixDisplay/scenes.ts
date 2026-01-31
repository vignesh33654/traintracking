import type { Train } from '@/app/types/train.types';
import { MatrixFrameContext, MatrixRenderer, Palette } from './MatrixRenderer';
import TextRenderer from './TextRenderer';

export type SceneMap = {
  [key in SceneName]: MatrixRenderer;
};

export interface SceneContext {
  dotMatrixDisplayRef: React.RefObject<{ getFrameContext: () => MatrixFrameContext } | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  palette: Palette;
  train: Train | null;
}

export abstract class Scene {
  constructor(
    public readonly renderer: MatrixRenderer,
    protected context: SceneContext,
    public readonly instructions: string,
  ) {}

  public setupControls(): void {}
  public cleanupControls(): void {}
}

export class StatusScene extends Scene {
  constructor(context: SceneContext) {
    const trainNumber = context.train?.trainNumber?.trim() || 'TRAIN';
    const trainName = context.train?.trainName?.trim() || 'UNKNOWN';
    const rawText = ` ${trainNumber} • ${trainName} `;
    const normalizedText = rawText
      .toUpperCase()
      // replace different dash variants with a space
      .replace(/[–—-]/g, ' ')
      // strip parentheses that the bitmap font cannot render
      .replace(/[()]/g, ' ')
      // keep only characters the bitmap font supports
      .replace(/[^A-Z0-9 !%.:?_•]/g, ' ')
      // collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
    const text = ` ${normalizedText} `;

 
    const renderer = new TextRenderer({
      text: text,
      speed: -1,
      charSpacing: 1,
      glow: true,
      cellShape: 'circle',
      cellPadding: 0.25,
      fps: 10,
      palette: context.palette,
    });
    super(renderer, context, text);
  }
}

export const scenes = {
  status: StatusScene,
};

export type SceneName = keyof typeof scenes;
