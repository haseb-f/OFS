import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  children: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-text-inverse)',
    border: '1px solid var(--color-primary)',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid transparent',
  },
  destructive: {
    backgroundColor: 'var(--color-status-rejected)',
    color: 'var(--color-text-inverse)',
    border: '1px solid var(--color-status-rejected)',
  },
};

const SIZE_STYLES: Record<ButtonSize, CSSProperties> = {
  sm: { paddingBlock: 'var(--space-1)', paddingInline: 'var(--space-3)', fontSize: 'var(--font-size-sm)' },
  md: { paddingBlock: 'var(--space-2)', paddingInline: 'var(--space-4)', fontSize: 'var(--font-size-base)' },
  lg: { paddingBlock: 'var(--space-3)', paddingInline: 'var(--space-6)', fontSize: 'var(--font-size-lg)' },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconStart,
  iconEnd,
  children,
  disabled,
  style: externalStyle,
  ...props
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 'var(--font-weight-medium)',
    fontFamily: 'var(--font-family-base)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
    whiteSpace: 'nowrap',
    ...VARIANT_STYLES[variant],
    ...SIZE_STYLES[size],
    ...externalStyle,
  };

  return (
    <button type="button" disabled={disabled ?? loading} style={baseStyle} {...props}>
      {iconStart && <span style={{ marginInlineEnd: 'var(--space-1)', display: 'flex' }}>{iconStart}</span>}
      {loading ? '...' : children}
      {iconEnd && <span style={{ marginInlineStart: 'var(--space-1)', display: 'flex' }}>{iconEnd}</span>}
    </button>
  );
}
