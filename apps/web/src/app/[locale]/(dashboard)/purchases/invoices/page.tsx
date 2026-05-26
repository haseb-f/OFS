'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockPurchaseInvoices,
  PI_STATUS_LABELS,
  type PiStatus,
} from '@/lib/purchasing-mock-data';
import { PiBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const PAGE_SIZE = 10;
const ALL_STATUSES: PiStatus[] = ['draft', 'approved', 'paid', 'cancelled'];

type SortKey = 'invoiceNumber' | 'totalAmount' | 'invoiceDate' | 'dueDate' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
    </svg>
  );
}

export default function PurchaseInvoicesPage() {
  useParams<{ locale: string }>();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<PiStatus | 'all'>('all');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('invoiceDate');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockPurchaseInvoices];
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(p =>
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q) ||
        p.vendorInvoiceRef.toLowerCase().includes(q) ||
        (p.poNumber ?? '').toLowerCase().includes(q),
      );
    }
    if (dateFrom) list = list.filter(p => p.invoiceDateIso >= dateFrom);
    if (dateTo)   list = list.filter(p => p.invoiceDateIso <= dateTo);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'invoiceNumber') cmp = a.invoiceNumber.localeCompare(b.invoiceNumber);
      if (sortKey === 'totalAmount')   cmp = a.totalAmount - b.totalAmount;
      if (sortKey === 'invoiceDate')   cmp = a.invoiceDateIso.localeCompare(b.invoiceDateIso);
      if (sortKey === 'dueDate')       cmp = a.dueDateIso.localeCompare(b.dueDateIso);
      if (sortKey === 'status')        cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

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
    const c: Record<string, number> = { all: mockPurchaseInvoices.length };
    ALL_STATUSES.forEach(s => { c[s] = mockPurchaseInvoices.filter(p => p.status === s).length; });
    return c;
  }, []);

  const hasFilters = statusFilter !== 'all' || search || dateFrom || dateTo;
  const totalUnpaid = filtered.filter(p => p.status === 'approved').reduce((s, p) => s + (p.totalAmount - p.paidAmount), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">فواتير المشتريات</h2>
          <p className="page-subtitle">{filtered.length} فاتورة</p>
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
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Outstanding summary */}
      {totalUnpaid > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
          padding: 'var(--space-4) var(--space-5)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', marginBlockEnd: 'var(--space-5)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBlockEnd: 2 }}>
              إجمالي المستحق
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
              {fNum(totalUnpaid)} ر.س
            </div>
          </div>
          <div style={{ inlineSize: 1, blockSize: 40, background: 'var(--color-border)', marginInline: 'var(--space-2)' }} />
          <div style={{ display: 'flex', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            {ALL_STATUSES.filter(s => s !== 'cancelled').map(s => (
              <div key={s}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBlockEnd: 2 }}>
                  {PI_STATUS_LABELS[s]}
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {statusCounts[s] ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status chips */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
            الكل <span className="filter-chip-count">{statusCounts.all}</span>
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {PI_STATUS_LABELS[s]}
              {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search + dates */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minInlineSize: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="form-input" placeholder="بحث بالرقم، المورد، مرجع الفاتورة..."
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
            onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} فاتورة محددة</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>اعتماد</button>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>تسجيل دفعة</button>
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
                <th className="sort-th" onClick={() => sort('invoiceNumber')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>رقم الفاتورة <SortIcon active={sortKey === 'invoiceNumber'} dir={sortDir} /></div>
                </th>
                <th>المورد</th>
                <th>رقم الفاتورة الخارجي</th>
                <th>أمر الشراء</th>
                <th className="sort-th" onClick={() => sort('totalAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الإجمالي <SortIcon active={sortKey === 'totalAmount'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('invoiceDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>تاريخ الفاتورة <SortIcon active={sortKey === 'invoiceDate'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('dueDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>تاريخ الاستحقاق <SortIcon active={sortKey === 'dueDate'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
                <th style={{ inlineSize: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={10} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span>لا توجد فواتير تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(pi => {
                const isOverdue = pi.status === 'approved' && pi.dueDateIso < '2026-05-25';
                return (
                  <tr key={pi.id} className={selected.has(pi.id) ? 'row-selected' : undefined}>
                    <td><input type="checkbox" checked={selected.has(pi.id)} onChange={() => toggle(pi.id)} /></td>
                    <td>
                      <span className="lead-order-link">{pi.invoiceNumber}</span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{pi.vendorName}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{pi.vendorInvoiceRef}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: pi.poNumber ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}>{pi.poNumber ?? '—'}</td>
                    <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {fNum(pi.totalAmount)} {pi.currency}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{pi.invoiceDate}</td>
                    <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: isOverdue ? '#b91c1c' : 'var(--color-text-muted)', fontWeight: isOverdue ? 'var(--font-weight-semibold)' : 'normal' }}>
                      {pi.dueDate}
                      {isOverdue && <span style={{ marginInlineStart: 4, fontSize: '0.6rem', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '1px 4px', borderRadius: 4 }}>متأخرة</span>}
                    </td>
                    <td><PiBadge status={pi.status} /></td>
                    <td>
                      {pi.status === 'approved' && (
                        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>دفع</button>
                      )}
                    </td>
                  </tr>
                );
              })}
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
