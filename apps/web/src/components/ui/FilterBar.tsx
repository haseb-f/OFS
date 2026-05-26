'use client';

import type { ReactNode } from 'react';

interface FilterBarProps {
  children: ReactNode;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
}

export default function FilterBar({
  children,
  hasFilters = false,
  onClearFilters,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`ofs-filter-bar${className ? ' ' + className : ''}`} role="search">
      {children}

      {hasFilters && onClearFilters && (
        <button
          type="button"
          className="ofs-filter-clear-btn"
          onClick={onClearFilters}
          aria-label="مسح جميع الفلاتر"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}
