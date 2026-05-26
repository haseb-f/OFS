import type { CSSProperties, ReactNode } from 'react';

interface StackProps {
  children: ReactNode;
  direction?: 'column' | 'row';
  gap?: string;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean;
  className?: string;
}

export function Stack({
  children,
  direction = 'column',
  gap = 'var(--space-4)',
  align,
  justify,
  wrap = false,
  className,
}: StackProps) {
  const style: CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
