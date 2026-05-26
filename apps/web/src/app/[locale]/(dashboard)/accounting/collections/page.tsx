'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCollections,
  COLLECTION_STATUS_LABELS,
  COLLECTION_MATCH_TYPE_LABELS,
  COLLECTION_PAYMENT_METHOD_LABELS,
  type CollectionStatus,
  type CollectionMatchType,
} from '@/lib/mock-data';
import CollectionStatusBadge from '@/components/collections/CollectionStatusBadge';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

// ── Score badge ───────────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number }) {
  const bg  = score >= 80 ? '#f0fdf4' : score >= 60 ? '#fffbeb' : '#fef2f2';
  const color = score >= 80 ? '#166534' : score >= 60 ? '#92400e' : '#991b1b';
  const border = score >= 80 ? '#bbf7d0' : score >= 60 ? '#fde68a' : '#fecaca';
  return (
    <span style={{ display: 'inline-block', background: bg, color, border: `1px solid ${border}`, borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
      {score}%
    </span>
  );
}

// ── Match type chip ────────────────────────────────────────────────────────────

function MatchTypeChip({ type }: { type: CollectionMatchType }) {
  return (
    <span className={type === 'automatic' ? 'col-match-auto' : 'col-match-manual'}>
      {type === 'automatic' ? '⚡' : '✎'} {COLLECTION_MATCH_TYPE_LABELS[type]}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const ALL_STATUSES: CollectionStatus[] = [
  'imported', 'suggested_match', 'matched', 'approved',
  'invoice_created', 'receipt_created', 'posted', 'rejected',
];

export default function CollectionsListPage() {
  const { locale } = useParams<{ locale: string }>();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatus]     = useState<CollectionStatus | 'all'>('all');
  const [matchTypeFilter, setMatchType] = useState<CollectionMatchType | 'all'>('all');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [page, setPage]               = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockCollections];
    if (statusFilter !== 'all')    data = data.filter(c => c.status === statusFilter);
    if (matchTypeFilter !== 'all') data = data.filter(c => c.match?.matchType === matchTypeFilter);
    if (dateFrom) data = data.filter(c => c.paymentDateIso >= dateFrom);
    if (dateTo)   data = data.filter(c => c.paymentDateIso <= dateTo);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(c =>
        c.reference.toLowerCase().includes(q) ||
        c.customerName.includes(q) ||
        (c.match?.orderNumber ?? '').toLowerCase().includes(q) ||
        (c.transactionRef ?? '').toLowerCase().includes(q),
      );
    }
    return data.sort((a, b) => b.paymentDateIso.localeCompare(a.paymentDateIso));
  }, [search, statusFilter, matchTypeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || statusFilter !== 'all' || matchTypeFilter !== 'all' || dateFrom || dateTo;

  // Stats
  const pending       = mockCollections.filter(c => c.status === 'suggested_match').length;
  const matched       = mockCollections.filter(c => c.status === 'matched' || c.status === 'approved' || c.status === 'invoice_created' || c.status === 'receipt_created' || c.status === 'posted').length;
  const unmatched     = mockCollections.filter(c => c.status === 'imported').length;

  return (
    <>

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">مركز التحصيل</h2>
          <p className="page-subtitle">إدارة التحصيلات ومطابقة الطلبات — {mockCollections.length} تحصيل</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link href={`/${locale}/accounting/collections/matching`} className="btn-outline" style={{ textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
            مركز المطابقة
          </Link>
          <button type="button" className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            تحصيل جديد
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="col-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إجمالي التحصيلات</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>{mockCollections.length}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>بانتظار المطابقة</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>{pending}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>غير مطابق</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{unmatched}</span>
        </div>
        <div className="col-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>مكتمل ومرحّل</span>
          <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{matched}</span>
        </div>
      </div>

      {/* Status quick filter pills */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-4)' }}>
        <button
          type="button"
          onClick={() => { setStatus('all'); setPage(1); }}
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${statusFilter === 'all' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: statusFilter === 'all' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: statusFilter === 'all' ? '#fff' : 'var(--color-text)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-medium)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          الكل ({mockCollections.length})
        </button>
        {ALL_STATUSES.map(s => {
          const count = mockCollections.filter(c => c.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              type="button"
              onClick={() => { setStatus(s); setPage(1); }}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${statusFilter === s ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: statusFilter === s ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === s ? '#fff' : 'var(--color-text)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {COLLECTION_STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-4)', padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="بحث بالمرجع، اسم العميل، رقم الطلب..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="ofs-input"
            style={{ flex: '1', minInlineSize: 220 }}
          />
          <OfsSelect
            options={[
              { value: 'all',       label: 'كل أنواع المطابقة' },
              { value: 'automatic', label: 'تلقائية' },
              { value: 'manual',    label: 'يدوية' },
            ]}
            value={matchTypeFilter}
            onChange={v => { setMatchType(v as typeof matchTypeFilter); setPage(1); }}
            size="sm"
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>من</span>
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} size="sm" />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>إلى</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} size="sm" />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost" onClick={() => { setSearch(''); setStatus('all'); setMatchType('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
              مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden', marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 900 }}>
            <thead>
              <tr>
                <th>رقم التحصيل</th>
                <th>العميل</th>
                <th className="col-amount">المبلغ</th>
                <th>تاريخ الدفع</th>
                <th>طريقة الدفع</th>
                <th>الطلب المطابق</th>
                <th>نوع المطابقة</th>
                <th style={{ textAlign: 'center' }}>النسبة</th>
                <th>الحالة</th>
                <th style={{ width: 100 }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد تحصيلات مطابقة
                  </td>
                </tr>
              ) : paginated.map(col => (
                <tr key={col.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-weight-medium)' }}>
                      {col.reference}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{col.customerName}</div>
                    {col.customerPhone && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>{col.customerPhone}</div>
                    )}
                  </td>
                  <td className="col-amount">
                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
                      {fNum(col.amount)} {col.currency}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{col.paymentDate}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>
                    {COLLECTION_PAYMENT_METHOD_LABELS[col.paymentMethod]}
                    {col.bank && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{col.bank}</div>}
                  </td>
                  <td>
                    {col.match ? (
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '2px 6px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                        {col.match.orderNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {col.match ? <MatchTypeChip type={col.match.matchType} /> : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {col.match ? <ScorePill score={col.match.totalScore} /> : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>}
                  </td>
                  <td><CollectionStatusBadge status={col.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Link
                        href={`/${locale}/accounting/collections/${col.id}`}
                        className="btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                      >
                        عرض
                      </Link>
                      {col.status === 'suggested_match' && (
                        <Link
                          href={`/${locale}/accounting/collections/matching`}
                          className="btn-outline"
                          style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', textDecoration: 'none' }}
                        >
                          مطابقة
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</button>
        </div>
      )}
    </>
  );
}
