'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockVendorPayments,
  VP_STATUS_LABELS,
  PAYMENT_METHODS,
  type VpStatus,
} from '@/lib/purchasing-mock-data';
import { VpBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const PAGE_SIZE = 10;
const ALL_STATUSES: VpStatus[] = ['draft', 'approved', 'paid', 'cancelled'];

type SortKey = 'paymentNumber' | 'amount' | 'paymentDate' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
    </svg>
  );
}

export default function VendorPaymentsPage() {
  useParams<{ locale: string }>();
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState<VpStatus | 'all'>('all');
  const [methodFilter,   setMethodFilter]   = useState<string>('all');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [selected,       setSelected]       = useState<Set<string>>(new Set());
  const [sortKey,        setSortKey]        = useState<SortKey>('paymentDate');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');
  const [page,           setPage]           = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockVendorPayments];
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (methodFilter !== 'all') list = list.filter(p => p.paymentMethod === methodFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.paymentNumber.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.reference.toLowerCase().includes(q) ||
        (p.invoiceNumber ?? '').toLowerCase().includes(q),
      );
    }
    if (dateFrom) list = list.filter(p => p.paymentDateIso >= dateFrom);
    if (dateTo)   list = list.filter(p => p.paymentDateIso <= dateTo);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'paymentNumber') cmp = a.paymentNumber.localeCompare(b.paymentNumber);
      if (sortKey === 'amount')        cmp = a.amount - b.amount;
      if (sortKey === 'paymentDate')   cmp = a.paymentDateIso.localeCompare(b.paymentDateIso);
      if (sortKey === 'status')        cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, methodFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }

  function toggleAll() {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map(p => p.id)));
  }

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: mockVendorPayments.length };
    ALL_STATUSES.forEach(s => { c[s] = mockVendorPayments.filter(p => p.status === s).length; });
    return c;
  }, []);

  const totalPaid    = mockVendorPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = mockVendorPayments.filter(p => p.status === 'approved').reduce((s, p) => s + p.amount, 0);
  const hasFilters   = statusFilter !== 'all' || methodFilter !== 'all' || search || dateFrom || dateTo;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">مدفوعات الموردين</h2>
          <p className="page-subtitle">{filtered.length} دفعة</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            دفعة جديدة
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBlockEnd: 'var(--space-5)' }}>
        {[
          { labelAr: 'إجمالي المدفوع', value: fNum(totalPaid) + ' ر.س', color: '#15803d', bg: '#f0fdf4' },
          { labelAr: 'بانتظار التنفيذ', value: fNum(totalPending) + ' ر.س', color: '#b45309', bg: '#fffbeb' },
          { labelAr: 'عدد الدفعات المنجزة', value: String(statusCounts.paid ?? 0), color: '#1d4ed8', bg: '#eff6ff' },
          { labelAr: 'دفعات معلقة', value: String(statusCounts.approved ?? 0), color: '#6d28d9', bg: '#f5f3ff' },
        ].map(stat => (
          <div key={stat.labelAr} className="kpi-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBlockEnd: 4 }}>
              {stat.labelAr}
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: stat.color, fontVariantNumeric: 'tabular-nums' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Status chips */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
            الكل <span className="filter-chip-count">{statusCounts.all}</span>
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {VP_STATUS_LABELS[s]}
              {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', minInlineSize: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="form-input" placeholder="بحث بالرقم، المورد، المرجع..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }} />
          </div>
          <select className="form-select" value={methodFilter} onChange={e => { setMethodFilter(e.target.value); setPage(1); }}
            style={{ blockSize: 36, inlineSize: 'auto', flex: '0 1 160px', fontSize: 'var(--font-size-sm)' }}>
            <option value="all">كل طرق الدفع</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>من</span>
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} size="sm" />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>إلى</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} size="sm" />
          </div>
        </div>
        {hasFilters && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => { setSearch(''); setStatusFilter('all'); setMethodFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} دفعة محددة</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>اعتماد</button>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>تصدير</button>
            <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }} onClick={() => setSelected(new Set())}>إلغاء التحديد</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 40 }}>
                  <input type="checkbox" checked={pageData.length > 0 && selected.size === pageData.length} onChange={toggleAll} />
                </th>
                <th className="sort-th" onClick={() => sort('paymentNumber')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>رقم الدفعة <SortIcon active={sortKey === 'paymentNumber'} dir={sortDir} /></div>
                </th>
                <th>المورد</th>
                <th>الفاتورة</th>
                <th className="sort-th" onClick={() => sort('amount')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>المبلغ <SortIcon active={sortKey === 'amount'} dir={sortDir} /></div>
                </th>
                <th>طريقة الدفع</th>
                <th>المرجع</th>
                <th className="sort-th" onClick={() => sort('paymentDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>تاريخ الدفع <SortIcon active={sortKey === 'paymentDate'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={9} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    <span>لا توجد دفعات تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(vp => (
                <tr key={vp.id} className={selected.has(vp.id) ? 'row-selected' : undefined}>
                  <td><input type="checkbox" checked={selected.has(vp.id)} onChange={() => toggle(vp.id)} /></td>
                  <td>
                    <div>
                      <span className="lead-order-link">{vp.paymentNumber}</span>
                      {vp.notes && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', maxInlineSize: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vp.notes}</div>}
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{vp.vendorName}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: vp.invoiceNumber ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}>
                    {vp.invoiceNumber ?? '—'}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', fontWeight: 'var(--font-weight-semibold)' }}>
                    {fNum(vp.amount)} {vp.currency}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{vp.paymentMethod}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', direction: 'ltr', textAlign: 'start' }}>
                    {vp.reference || '—'}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{vp.paymentDate}</td>
                  <td><VpBadge status={vp.status} /></td>
                </tr>
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
              <button className="pagination-page" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>›</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-page${p === page ? ' active' : ''}`} onClick={() => setPage(p)}
                  style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: p === page ? 'var(--color-primary)' : 'none', color: p === page ? '#fff' : 'inherit', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}>
                  {p}
                </button>
              ))}
              <button className="pagination-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>‹</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
