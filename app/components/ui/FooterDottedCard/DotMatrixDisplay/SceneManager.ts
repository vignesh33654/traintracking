"use client";

import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

import type { Train } from '@/app/types/train.types';
import useColorTheme from '../useColorTheme';
import { MatrixFrameContext, MatrixRenderer, Palette } from './MatrixRenderer';
import {
  Scene,
  SceneContext,
  SceneName,
  StatusScene,
} from './scenes';
import TransitionRenderer from './TransitionRenderer';
import { getPalette } from './util';

export class SceneManager {
  private context: SceneContext;
  public scenes: Record<SceneName, Scene> | null = null;
  private transitionRenderer: TransitionRenderer;
  private activeSceneName: SceneName | null = null;
  private isTransitioning = false;

  public onSceneRendererChange: (activeRenderer: MatrixRenderer) => void;

  constructor(
    context: SceneContext,
    onSceneRendererChange: (activeRenderer: MatrixRenderer) => void,
  ) {
    this.context = context;
    this.onSceneRendererChange = onSceneRendererChange;

    this.transitionRenderer = new TransitionRenderer({
      cellPadding: 0.25,
      palette: context.palette,
    });
  }

  public init() {
    this.scenes = {
      status: new StatusScene(this.context),
    };

    this.activeSceneName = 'status';
    this.onSceneRendererChange(this.scenes.status.renderer);
  }

  public getActiveScene(): Scene | null {
    if (!this.activeSceneName || !this.scenes) {
      return null;
    }
    return this.scenes[this.activeSceneName];
  }

  public getActiveSceneRenderer(): MatrixRenderer | null {
    return this.getActiveScene()?.renderer || null;
  }

  public switchTo(name: SceneName) {
    const ctx = this.context.dotMatrixDisplayRef.current?.getFrameContext();
    if (!ctx || !this.scenes || this.activeSceneName === name || this.isTransitioning) {
      return;
    }

    const currentScene = this.scenes[this.activeSceneName!];
    const nextScene = this.scenes[name];

    currentScene.renderer.pause();

    const prevScene = currentScene;

    const transitionDirection = 'down';

    this.isTransitioning = true;
    this.transitionRenderer
      .renderTransition(ctx, { durationSeconds: 0.7, direction: transitionDirection })
      .then(() => {
        nextScene.renderer?.restart?.();
        nextScene.renderer.resume();

        prevScene.cleanupControls();

        // only set up controls if the container has focus
        if (document.activeElement === this.context.containerRef.current) {
          nextScene.setupControls();
        }

        this.activeSceneName = name;
        this.onSceneRendererChange(nextScene.renderer);
        this.isTransitioning = false;
      });
  }

  public setPalette(palette: Palette) {
    this.context.palette = palette;
    if (!this.scenes) {
      return;
    }

    Object.values(this.scenes).forEach((scene) => {
      scene.renderer.setPalette(palette);
    });
    this.transitionRenderer.setPalette(palette);
  }

  public setupActiveControls() {
    if (this.activeSceneName && this.scenes) {
      this.scenes[this.activeSceneName].setupControls();
    }
  }

  public cleanupActiveControls() {
    if (this.activeSceneName && this.scenes) {
      this.scenes[this.activeSceneName].cleanupControls();
    }
  }
}

interface UseSceneManagerParams {
  train: Train | null;
  dotMatrixDisplayRef: React.RefObject<{ getFrameContext: () => MatrixFrameContext } | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const useSceneManager = ({
  train,
  dotMatrixDisplayRef,
  containerRef,
}: UseSceneManagerParams) => {
  const { colorTheme } = useColorTheme();
  const { resolvedTheme } = useTheme();

  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [activeRenderer, setActiveRenderer] = useState<MatrixRenderer | null>(null);

  useEffect(() => {
    const context: SceneContext = {
      dotMatrixDisplayRef,
      containerRef,
      palette: getPalette({ resolvedTheme }),
      train,
    };

    const instance = new SceneManager(context, (newActiveRenderer) => {
      setActiveRenderer(newActiveRenderer);
    });

    instance.init();
    sceneManagerRef.current = instance;

    const container = containerRef.current;

    return () => {
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    train,
    dotMatrixDisplayRef,
    containerRef,
  ]);

  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setPalette(getPalette({ resolvedTheme, colorTheme }));
    }
  }, [resolvedTheme, colorTheme]);

  return { sceneManager: sceneManagerRef.current, activeRenderer };
};
