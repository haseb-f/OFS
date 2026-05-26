'use client';

import { useState, type ReactNode } from 'react';
import SearchInput from './SearchInput';

interface TableToolbarProps {
  /** Search field — omit to hide */
  search?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Slot for filter controls (OfsSelect, etc.) */
  filters?: ReactNode;
  /** Row count info, e.g. "12 / 40" */
  resultCount?: number;
  totalCount?: number;
  /** Export handler — renders export button when provided */
  onExport?: () => void;
  /** Refresh handler — renders refresh button when provided */
  onRefresh?: () => void;
}

export default function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters,
  resultCount,
  totalCount,
  onExport,
  onRefresh,
}: TableToolbarProps) {
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    onRefresh();
    setTimeout(() => { setRefreshing(false); }, 700);
  }

  const showCount =
    resultCount !== undefined &&
    totalCount !== undefined &&
    resultCount !== totalCount;

  return (
    <div className="ofs-table-toolbar" role="toolbar" aria-label="أدوات الجدول">

      {/* Search */}
      {onSearchChange && (
        <div className="ofs-table-toolbar-search">
          <SearchInput
            value={search ?? ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Filter slot */}
      {filters && (
        <div className="ofs-table-toolbar-filters">{filters}</div>
      )}

      {/* End actions */}
      <div className="ofs-table-toolbar-end">
        {showCount && (
          <span className="ofs-table-result-count">
            {resultCount} / {totalCount}
          </span>
        )}

        {onRefresh && (
          <button
            type="button"
            className={`ofs-toolbar-icon-btn${refreshing ? ' spinning' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
            title="تحديث"
            aria-label="تحديث البيانات"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
          </button>
        )}

        {onExport && (
          <button
            type="button"
            className="ofs-toolbar-icon-btn"
            onClick={onExport}
            title="تصدير"
            aria-label="تصدير البيانات"
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
