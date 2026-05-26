import type { CSSProperties, ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const MAX_WIDTHS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
};

export function Container({ children, maxWidth = 'xl', className }: ContainerProps) {
  const style: CSSProperties = {
    maxInlineSize: MAX_WIDTHS[maxWidth],
    marginInline: 'auto',
    paddingInline: 'var(--space-4)',
    inlineSize: '100%',
  };

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
