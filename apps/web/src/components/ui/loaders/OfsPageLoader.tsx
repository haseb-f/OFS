'use client';

import { OfsSpinner } from './OfsSpinner';

interface OfsPageLoaderProps {
  label?: string;
}

function OfsLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2L3 6v8l7 4 7-4V6l-7-4z"
        fill="currentColor"
        fillOpacity="0.9"
      />
    </svg>
  );
}

export function OfsPageLoader({ label = 'جاري التحميل...' }: OfsPageLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      className="ofs-page-loader"
    >
      <div className="ofs-page-loader__ring-wrap">
        <div className="ofs-page-loader__halo" aria-hidden="true" />
        <div className="ofs-page-loader__ring" aria-hidden="true" />
        <div className="ofs-page-loader__logo" aria-hidden="true">
          <OfsLogo />
        </div>
      </div>
      <span
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function OfsFullScreenLoader({ label }: OfsPageLoaderProps) {
  return (
    <div
      className="ofs-fullscreen-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label ?? 'جاري التحميل'}
    >
      <OfsPageLoader label={label} />
    </div>
  );
}

export function OfsInlineLoader({ label = 'جاري التحميل...' }: OfsPageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: 'var(--space-8) 0',
      }}
    >
      <OfsSpinner size="lg" color="primary" aria-label={label} />
      <span
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
    </div>
  );
}
