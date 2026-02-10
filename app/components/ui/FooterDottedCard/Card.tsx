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

  return (
    <Component
      ref={ref}
      className={cn(
        'flex justify-center items-center fixed bottom-2.5 left-4 rounded-[10px]',
        containerClassName,
      )}
      id={id}
    >
      <div
        className={cn(
          'card bg-panel-background relative z-1 flex h-full flex-col rounded-[9px] p- [&>*:first-child]:flex-1',
          className,
        )}
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
