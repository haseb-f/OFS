'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockSalesCollections,
  COLLECTION_STATUS_LABELS, COLLECTION_PAYMENT_LABELS,
  type CollectionStatus, type CollectionMatchingStatus, type CollectionPaymentMethod, type SalesCollection,
} from '@/lib/mock-data';
import { CollectionStatusBadge, CollectionMatchBadge } from '@/components/sales/CollectionStatusBadge';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum, fDate } from '@/lib/format';

const PAGE_SIZE = 10;
const ALL_STATUSES:  CollectionStatus[]         = ['approved', 'posted'];
const ALL_METHODS:   CollectionPaymentMethod[]   = ['cash', 'bank_transfer', 'card', 'check'];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

type SortKey = 'collectionDate' | 'amount' | 'customerName' | 'status' | 'matchingStatus';

const METHOD_ICON: Record<CollectionPaymentMethod, string> = {
  cash: '💵', bank_transfer: '🏦', card: '💳', check: '📄',
};

export default function CollectionsPage() {
  const { locale: _locale } = useParams<{ locale: string }>();
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState<CollectionStatus | 'all'>('all');
  const [matchingFilter, setMatchingFilter] = useState<CollectionMatchingStatus | 'all'>('all');
  const [methodFilter,   setMethodFilter]   = useState<CollectionPaymentMethod | 'all'>('all');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [sortKey,        setSortKey]        = useState<SortKey>('collectionDate');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');
  const [page,           setPage]           = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockSalesCollections];
    if (statusFilter   !== 'all') list = list.filter(c => c.status === statusFilter);
    if (matchingFilter !== 'all') list = list.filter(c => c.matchingStatus === matchingFilter);
    if (methodFilter   !== 'all') list = list.filter(c => c.paymentMethod === methodFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(x => x.collectionNumber.toLowerCase().includes(q) || x.customerName.toLowerCase().includes(q) || (x.reference?.toLowerCase().includes(q)) || (x.invoiceRef?.toLowerCase().includes(q)));
    }
    if (dateFrom) list = list.filter(c => c.collectionDateIso >= dateFrom);
    if (dateTo)   list = list.filter(c => c.collectionDateIso <= dateTo);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'collectionDate') cmp = a.collectionDateIso.localeCompare(b.collectionDateIso);
      if (sortKey === 'amount')         cmp = a.amount - b.amount;
      if (sortKey === 'customerName')   cmp = a.customerName.localeCompare(b.customerName);
      if (sortKey === 'status')         cmp = a.status.localeCompare(b.status);
      if (sortKey === 'matchingStatus') cmp = a.matchingStatus.localeCompare(b.matchingStatus);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, matchingFilter, methodFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const matchCounts = useMemo(() => ({
    all:       mockSalesCollections.length,
    unmatched: mockSalesCollections.filter(c => c.matchingStatus === 'unmatched').length,
    partial:   mockSalesCollections.filter(c => c.matchingStatus === 'partial').length,
    matched:   mockSalesCollections.filter(c => c.matchingStatus === 'matched').length,
  }), []);

  const statusCounts = useMemo(() => ({
    all:      mockSalesCollections.length,
    approved: mockSalesCollections.filter(c => c.status === 'approved').length,
    posted:   mockSalesCollections.filter(c => c.status === 'posted').length,
  }), []);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }
  function toggleAll() { setSelected(selected.size === pageData.length ? new Set() : new Set(pageData.map(c => c.id))); }
  function toggle(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const hasFilters = statusFilter !== 'all' || matchingFilter !== 'all' || methodFilter !== 'all' || search || dateFrom || dateTo;
  const totalAmount = filtered.reduce((s, c) => s + c.amount, 0);
  const unmatchedCount = mockSalesCollections.filter(c => c.matchingStatus === 'unmatched').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">التحصيلات</h2>
          <p className="page-subtitle">{filtered.length} تحصيل · إجمالي: {fNum(totalAmount)} SAR</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            تحصيل جديد
          </button>
        </div>
      </div>

      {/* Unmatched alert */}
      {unmatchedCount > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)', marginBlockEnd: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span style={{ fontSize: 'var(--font-size-sm)', color: '#92400e' }}>
            يوجد <strong>{unmatchedCount}</strong> تحصيلات غير مرتبطة بفواتير — يرجى مراجعتها وربطها.
          </span>
          <button className="btn-ghost" style={{ marginInlineStart: 'auto', fontSize: 'var(--font-size-xs)', color: '#b45309' }}
            onClick={() => { setMatchingFilter('unmatched'); setPage(1); }}>
            عرض الغير مرتبطة
          </button>
        </div>
      )}

      {/* Matching status tabs */}
      <div style={{ display: 'flex', gap: 0, marginBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)', paddingBlockEnd: 0 }}>
        {([
          ['all',       'الكل',         matchCounts.all],
          ['unmatched', 'غير مرتبط',   matchCounts.unmatched],
          ['partial',   'مرتبط جزئياً', matchCounts.partial],
          ['matched',   'مرتبط',        matchCounts.matched],
        ] as [string, string, number][]).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => { setMatchingFilter(val as CollectionMatchingStatus | 'all'); setPage(1); }}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-base)',
              fontWeight: matchingFilter === val ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              color: matchingFilter === val ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBlockEnd: matchingFilter === val ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBlockEnd: -1,
              transition: 'color var(--transition-fast)',
            }}
          >
            {label}
            <span style={{ marginInlineStart: 'var(--space-2)', background: matchingFilter === val ? 'var(--color-primary)' : 'var(--color-surface-overlay)', color: matchingFilter === val ? '#fff' : 'var(--color-text-muted)', borderRadius: 'var(--radius-full)', padding: '1px 6px', fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Status + method chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-3)', alignItems: 'center' }}>
        <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
          كل الحالات <span className="filter-chip-count">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {COLLECTION_STATUS_LABELS[s]}
            {(statusCounts[s as keyof typeof statusCounts] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s as keyof typeof statusCounts]}</span>}
          </button>
        ))}
        <span style={{ color: 'var(--color-border)', marginInline: 'var(--space-1)' }}>|</span>
        <select className="form-input" value={methodFilter} onChange={e => { setMethodFilter(e.target.value as CollectionPaymentMethod | 'all'); setPage(1); }}
          style={{ blockSize: 32, fontSize: 'var(--font-size-xs)', inlineSize: 'auto', minInlineSize: 130, paddingInline: 'var(--space-3)' }}>
          <option value="all">كل طرق الدفع</option>
          {ALL_METHODS.map(m => <option key={m} value={m}>{COLLECTION_PAYMENT_LABELS[m]}</option>)}
        </select>
      </div>

      {/* Search + date */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minInlineSize: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="form-input" placeholder="بحث بالرقم، العميل، المرجع..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>من</span>
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} size="sm" />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>إلى</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} size="sm" />
          </div>
        </div>
        {hasFilters && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => { setSearch(''); setStatusFilter('all'); setMatchingFilter('all'); setMethodFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} تحصيل محدد</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>ترحيل المحدد</button>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>ربط بفاتورة</button>
            <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }} onClick={() => setSelected(new Set())}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}><input type="checkbox" checked={pageData.length > 0 && selected.size === pageData.length} onChange={toggleAll} /></th>
                <th>رقم التحصيل</th>
                <th className="sort-th" onClick={() => sort('customerName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('amount')} style={{ cursor: 'pointer', textAlign: 'end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>المبلغ <SortIcon active={sortKey === 'amount'} dir={sortDir} /></div>
                </th>
                <th>طريقة الدفع</th>
                <th className="sort-th" onClick={() => sort('matchingStatus')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>حالة الربط <SortIcon active={sortKey === 'matchingStatus'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('collectionDate')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>التاريخ <SortIcon active={sortKey === 'collectionDate'} dir={sortDir} /></div>
                </th>
                <th>الفاتورة</th>
                <th>المرجع</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={11} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    <span>لا توجد تحصيلات تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(col => (
                <CollectionRow key={col.id} col={col} selected={selected.has(col.id)} onToggle={() => toggle(col.id)} />
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="leads-pagination">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>›</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: p === page ? 'var(--color-primary)' : 'none', color: p === page ? '#fff' : 'inherit', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>‹</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CollectionRow({ col, selected, onToggle }: { col: SalesCollection; selected: boolean; onToggle: () => void }) {
  return (
    <tr className={selected ? 'row-selected' : undefined}>
      <td><input type="checkbox" checked={selected} onChange={onToggle} /></td>
      <td>
        <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'inline-block' }}>
          {col.collectionNumber}
        </span>
      </td>
      <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {col.customerName}
      </td>
      <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-status-active)' }}>
        {fNum(col.amount)} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-regular)' }}>{col.currency}</span>
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1rem' }}>{METHOD_ICON[col.paymentMethod]}</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{COLLECTION_PAYMENT_LABELS[col.paymentMethod]}</span>
        </div>
      </td>
      <td><CollectionMatchBadge status={col.matchingStatus} /></td>
      <td><CollectionStatusBadge status={col.status} /></td>
      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {fDate(col.collectionDateIso, true)}
      </td>
      <td>
        {col.invoiceRef ? (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'inline-block' }}>
            {col.invoiceRef}
          </span>
        ) : (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>غير محدد</span>
        )}
      </td>
      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'table-cell' }}>
        {col.reference ?? '—'}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}>عرض</button>
          {col.matchingStatus === 'unmatched' && (
            <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '0.6rem', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>ربط</button>
          )}
        </div>
      </td>
    </tr>
  );
}
