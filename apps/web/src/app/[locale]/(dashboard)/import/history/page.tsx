'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockImports,
  IMPORT_SOURCE_LABELS,
  IMPORT_TARGET_LABELS,
  IMPORT_STATUS_LABELS,
  type ImportStatus,
  type ImportSource,
  type ImportTarget,
} from '@/lib/mock-data';
import ImportStatusBadge from '@/components/import/ImportStatusBadge';
import FilterBar from '@/components/ui/FilterBar';
import OfsSelect, { type OfsSelectOption } from '@/components/ui/OfsSelect';
import SearchInput from '@/components/ui/SearchInput';
import TableToolbar from '@/components/ui/TableToolbar';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type SortKey = 'createdAt' | 'name' | 'totalRows' | 'successRows';

const STATUS_OPTIONS: OfsSelectOption[] = [
  { value: 'all', label: 'كل الحالات' },
  ...(Object.keys(IMPORT_STATUS_LABELS) as ImportStatus[]).map(s => ({
    value: s,
    label: IMPORT_STATUS_LABELS[s],
  })),
];

const SOURCE_OPTIONS: OfsSelectOption[] = [
  { value: 'all', label: 'كل المصادر' },
  ...(Object.keys(IMPORT_SOURCE_LABELS) as ImportSource[]).map(s => ({
    value: s,
    label: IMPORT_SOURCE_LABELS[s],
  })),
];

const TARGET_OPTIONS: OfsSelectOption[] = [
  { value: 'all', label: 'كل الوجهات' },
  ...(Object.keys(IMPORT_TARGET_LABELS) as ImportTarget[]).map(t => ({
    value: t,
    label: IMPORT_TARGET_LABELS[t],
  })),
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ImportHistoryPage() {
  const { locale } = useParams<{ locale: string }>();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  const [sortBy,       setSortBy]       = useState<SortKey>('createdAt');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockImports];
    if (statusFilter !== 'all') data = data.filter(i => i.status === statusFilter);
    if (sourceFilter !== 'all') data = data.filter(i => i.source === sourceFilter);
    if (targetFilter !== 'all') data = data.filter(i => i.target === targetFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        i =>
          i.name.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q) ||
          (i.fileName ?? '').toLowerCase().includes(q),
      );
    }
    data.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortBy) {
        case 'name':        av = a.name;        bv = b.name;        break;
        case 'totalRows':   av = a.totalRows;   bv = b.totalRows;   break;
        case 'successRows': av = a.successRows; bv = b.successRows; break;
        default:            av = a.createdAt;   bv = b.createdAt;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    return data;
  }, [search, statusFilter, sourceFilter, targetFilter, sortBy, sortDir]);

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search !== '' || statusFilter !== 'all' || sourceFilter !== 'all' || targetFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setTargetFilter('all');
    setPage(1);
  }

  function toggleSort(col: SortKey) {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortBy !== col) return <span style={{ opacity: 0.28, fontSize: '0.7em' }}>↕</span>;
    return <span style={{ color: 'var(--color-primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  function handleExport() {
    // mock export — no backend
    const csv = [
      ['الاسم', 'المصدر', 'الوجهة', 'الحالة', 'ناجح', 'خطأ', 'التاريخ'],
      ...filtered.map(i => [
        i.name,
        IMPORT_SOURCE_LABELS[i.source],
        IMPORT_TARGET_LABELS[i.target],
        IMPORT_STATUS_LABELS[i.status],
        String(i.successRows),
        String(i.errorRows),
        i.createdAt,
      ]),
    ]
      .map(r => r.join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'import-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h2 className="page-title">سجل الاستيرادات</h2>
          <p className="page-subtitle">
            جميع عمليات الاستيراد
            {hasFilters
              ? ` — ${totalCount} نتيجة`
              : ` — ${mockImports.length} سجل`}
          </p>
        </div>
        <Link href={`/${locale}/import/new`} className="btn-cta" style={{ textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          استيراد جديد
        </Link>
      </div>

      {/* ── Filter Bar ── */}
      <FilterBar hasFilters={hasFilters} onClearFilters={clearFilters}>

        {/* Search */}
        <div className="ofs-filter-bar-search">
          <SearchInput
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="بحث باسم الاستيراد أو الملف..."
          />
        </div>

        {/* Status */}
        <div className="ofs-filter-bar-select">
          <OfsSelect
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setPage(1); }}
            aria-label="فلتر الحالة"
          />
        </div>

        {/* Source */}
        <div className="ofs-filter-bar-select">
          <OfsSelect
            options={SOURCE_OPTIONS}
            value={sourceFilter}
            onChange={v => { setSourceFilter(v); setPage(1); }}
            aria-label="فلتر المصدر"
          />
        </div>

        {/* Target */}
        <div className="ofs-filter-bar-select">
          <OfsSelect
            options={TARGET_OPTIONS}
            value={targetFilter}
            onChange={v => { setTargetFilter(v); setPage(1); }}
            aria-label="فلتر الوجهة"
          />
        </div>

      </FilterBar>

      {/* ── Table Card ── */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>

        {/* Toolbar inside card */}
        <TableToolbar
          resultCount={totalCount}
          totalCount={mockImports.length}
          onExport={handleExport}
          onRefresh={() => { /* mock refresh — data is static */ }}
        />

        <table className="ofs-table">
          <thead>
            <tr>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('name')}
              >
                الاسم <SortIcon col="name" />
              </th>
              <th>المصدر</th>
              <th>الوجهة</th>
              <th>الحالة</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('totalRows')}
              >
                إجمالي الصفوف <SortIcon col="totalRows" />
              </th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('successRows')}
              >
                ناجح / خطأ <SortIcon col="successRows" />
              </th>
              <th>الملف</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSort('createdAt')}
              >
                التاريخ <SortIcon col="createdAt" />
              </th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-12)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <span>لا توجد نتائج تطابق الفلاتر الحالية</span>
                    {hasFilters && (
                      <button type="button" className="btn-ghost" onClick={clearFilters} style={{ fontSize: 'var(--font-size-xs)' }}>
                        مسح الفلاتر
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : paginated.map(imp => (
              <tr key={imp.id}>
                <td>
                  <Link
                    href={`/${locale}/import/${imp.id}`}
                    style={{
                      fontWeight: 'var(--font-weight-medium)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-primary)',
                      textDecoration: 'none',
                    }}
                  >
                    {imp.name}
                  </Link>
                </td>
                <td>
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    padding: '2px 8px',
                    background: 'var(--color-surface-raised)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                  }}>
                    {IMPORT_SOURCE_LABELS[imp.source]}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-size-sm)' }}>
                  {IMPORT_TARGET_LABELS[imp.target]}
                </td>
                <td><ImportStatusBadge status={imp.status} /></td>
                <td style={{ fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums' }}>
                  {imp.status === 'draft' ? '—' : imp.totalRows}
                </td>
                <td style={{ fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums' }}>
                  {imp.status === 'draft' ? '—' : (
                    <>
                      <span style={{ color: 'var(--color-status-active)' }}>{imp.successRows}</span>
                      {imp.errorRows > 0 && (
                        <span style={{ color: '#b91c1c' }}> / {imp.errorRows} خطأ</span>
                      )}
                    </>
                  )}
                </td>
                <td style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)',
                  maxInlineSize: 160,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {imp.fileName ?? imp.sheetUrl ?? '—'}
                </td>
                <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                  {imp.createdAt}
                </td>
                <td>
                  <Link
                    href={`/${locale}/import/${imp.id}`}
                    className="btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                  >
                    عرض
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBlockStart: 'var(--space-4)',
        }}>
          <button
            className="btn-outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            السابق
          </button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', minInlineSize: 60, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn-outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            التالي
          </button>
        </div>
      )}
    </>
  );
}
