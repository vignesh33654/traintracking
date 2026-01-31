'use client';

import { forwardRef, ReactNode, useRef } from 'react';

import { relativeMouseClassname } from '../FooterDottedCard/MousePositionVarsSetter';
import { cn } from '../FooterDottedCard/util';

import './Card.css';

type Props = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  as?: 'div' | 'article';
  id?: string;
};

const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { children, className, id, containerClassName, as = 'article' },
  ref,
) {
  const Component = as;

  const borderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Component
      className={cn(
        'flex justify-center items-center fixed bottom-[4px] left-1/2 -translate-x-1/2  rounded-[10px] w-[calc(100%-32px)] max-w-[360px] p-px md:left-[16px] md:translate-x-0 md:w-auto md:max-w-none',
        containerClassName,
      )}
      id={id}
    >
      <div
        className={cn(
          'card bg-panel-background relative z-1 flex h-full flex-col rounded-[9px] p-3 [&>*:first-child]:flex-1',
          className,
        )}
        ref={contentRef}
      >
        {children}
      </div>
      <div
        className={cn(
          'bg-theme-1 absolute top-0 left-0 h-full w-full rounded-[10px] opacity-100',
          relativeMouseClassname,
        )}
        ref={borderRef}
      />
    </Component>
  );
});

export default Card;
