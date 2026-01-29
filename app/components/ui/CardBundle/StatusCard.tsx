'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { Train } from '@/app/types/train.types';
import { cn } from './util';

import Card from './Card';
import DotMatrixDisplay, {
  MatrixFrameContext,
  useSceneManager,
} from './DotMatrixDisplay';

export default function StatusCard({ train }: { train: Train | null }) {
  const [init, setInit] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dotMatrixDisplayRef = useRef<{ getFrameContext: () => MatrixFrameContext }>(null);

  const instructions = 'Train status display';

  const { sceneManager, activeRenderer } = useSceneManager({
    train,
    dotMatrixDisplayRef,
    containerRef,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sceneManager) {
      return;
    }

    const handleFocus = () => sceneManager.setupActiveControls();
    const handleBlur = () => sceneManager.cleanupActiveControls();

    container.addEventListener('focus', handleFocus);
    container.addEventListener('blur', handleBlur);

    return () => {
      container.removeEventListener('focus', handleFocus);
      container.removeEventListener('blur', handleBlur);
    };
  }, [sceneManager]);

  useEffect(() => {
    return () => {
      sceneManager?.cleanupActiveControls();
    };
  }, [sceneManager]);

  const handleRender = useCallback(
    (ctx: MatrixFrameContext) => {
      activeRenderer?.render.call(activeRenderer, ctx);
    },
    [activeRenderer],
  );

  return (
    <Card className="">
      <div className=" absolute top-0 left-1/2 -translate-x-1/2 flex flex-col w-80 justify-between gap-5">
        <div
          className="border-panel-border focus-visible:outline-theme-1/20 rounded-lg border bg-black p-1 focus-visible:outline-[0.5px] focus-visible:outline-none"
          tabIndex={0}
          ref={containerRef}
          role="application"
          aria-label="System status display"
          aria-describedby="statuscard-instructions"
        >
          <div className="relative" style={{ height: 4 * 7 }}>
            <DotMatrixDisplay
              className={cn(
                'absolute top-0 left-1/2 -translate-x-1/2 overflow-clip rounded opacity-0 transition-opacity duration-1000',
                { 'opacity-100': init },
              )}
              onRender={handleRender}
              onInit={() => setInit(true)}
              rows={7}
              cellSize={4}
              ref={dotMatrixDisplayRef}
            />
          </div>
          <p id="statuscard-instructions" className="sr-only">
            {instructions}
          </p>
        </div>
      </div>
    </Card>
  );
}
