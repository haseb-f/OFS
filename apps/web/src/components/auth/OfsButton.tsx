'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { OfsSpinner } from '@/components/ui/loaders/OfsSpinner';

export type OfsButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASS: Record<OfsButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-outline',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const SPINNER_COLOR: Record<OfsButtonVariant, 'white' | 'primary' | 'muted'> = {
  primary: 'white',
  secondary: 'primary',
  danger: 'white',
  ghost: 'muted',
};

interface OfsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: OfsButtonVariant;
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function OfsButton({
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  type = 'button',
  ...props
}: OfsButtonProps) {
  const variantClass = VARIANT_CLASS[variant];
  const classes = [variantClass, className].filter(Boolean).join(' ');

  // Always disabled while loading. `??` doesn't work here because an
  // explicit `disabled={false}` from the caller would swallow `loading`.
  const isDisabled = loading || (disabled ?? false);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={classes}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="ofs-btn-loading">
          <OfsSpinner size="sm" color={SPINNER_COLOR[variant]} aria-label={loadingText ?? 'جاري التحميل'} />
          {loadingText && <span>{loadingText}</span>}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
