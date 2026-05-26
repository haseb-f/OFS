'use client';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpinnerColor = 'white' | 'primary' | 'muted';

interface OfsSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
  'aria-label'?: string;
}

export function OfsSpinner({
  size = 'md',
  color = 'primary',
  className,
  'aria-label': ariaLabel = 'جاري التحميل',
}: OfsSpinnerProps) {
  const classes = [
    'ofs-spinner',
    `ofs-spinner--${size}`,
    `ofs-spinner--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={classes}
    />
  );
}
