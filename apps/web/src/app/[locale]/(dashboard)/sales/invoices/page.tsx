'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockSalesInvoices, SALES_INVOICE_STATUS_LABELS, SALES_INVOICE_SOURCE_LABELS,
  type SalesInvoiceStatus, type SalesInvoiceSource, type SalesInvoice,
} from '@/lib/mock-data';
import InvoiceStatusBadge from '@/components/sales/InvoiceStatusBadge';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum, fDate } from '@/lib/format';

const PAGE_SIZE = 10;
const ALL_STATUSES: SalesInvoiceStatus[] = ['draft', 'approved', 'posted', 'cancelled'];
const ALL_SOURCES: SalesInvoiceSource[]  = ['order_based', 'collection_based', 'manual'];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

type SortKey = 'issueDate' | 'totalAmount' | 'paidAmount' | 'customerName' | 'status';

const SOURCE_LABEL_SHORT: Record<SalesInvoiceSource, string> = {
  order_based:      'مبني على طلب',
  collection_based: 'مبني على تحصيل',
  manual:           'يدوي',
};

const SOURCE_CLS: Record<SalesInvoiceSource, string> = {
  order_based:      'invoice-source-order',
  collection_based: 'invoice-source-collection',
  manual:           'invoice-source-manual',
};

export default function SalesInvoicesPage() {
  const { locale: _locale } = useParams<{ locale: string }>();
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState<SalesInvoiceStatus | 'all'>('all');
  const [sourceFilter,  setSourceFilter]  = useState<SalesInvoiceSource | 'all'>('all');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [sortKey,       setSortKey]       = useState<SortKey>('issueDate');
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [page,          setPage]          = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockSalesInvoices];
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter);
    if (sourceFilter !== 'all') list = list.filter(i => i.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(x => x.invoiceNumber.toLowerCase().includes(q) || x.customerName.toLowerCase().includes(q));
    }
    if (dateFrom) list = list.filter(i => i.issueDateIso >= dateFrom);
    if (dateTo)   list = list.filter(i => i.issueDateIso <= dateTo);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'issueDate')    cmp = a.issueDateIso.localeCompare(b.issueDateIso);
      if (sortKey === 'totalAmount')  cmp = a.totalAmount - b.totalAmount;
      if (sortKey === 'paidAmount')   cmp = a.paidAmount - b.paidAmount;
      if (sortKey === 'customerName') cmp = a.customerName.localeCompare(b.customerName);
      if (sortKey === 'status')       cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, sourceFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: mockSalesInvoices.length };
    ALL_STATUSES.forEach(s => { c[s] = mockSalesInvoices.filter(i => i.status === s).length; });
    return c;
  }, []);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }
  function toggleAll() { setSelected(selected.size === pageData.length ? new Set() : new Set(pageData.map(i => i.id))); }
  function toggle(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const hasFilters = statusFilter !== 'all' || sourceFilter !== 'all' || search || dateFrom || dateTo;

  const totalOutstanding = filtered.reduce((s, i) => s + (i.totalAmount - i.paidAmount), 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">فواتير المبيعات</h2>
          <p className="page-subtitle">{filtered.length} فاتورة · مستحق: {fNum(totalOutstanding)} SAR</p>
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
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Source tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginBlockEnd: 'var(--space-3)', borderBlockEnd: '1px solid var(--color-border)', paddingBlockEnd: 0 }}>
        {([['all', 'الكل'], ...ALL_SOURCES.map(s => [s, SOURCE_LABEL_SHORT[s as SalesInvoiceSource]])] as [string, string][]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setSourceFilter(val as SalesInvoiceSource | 'all'); setPage(1); }}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 'var(--font-size-sm)', fontFamily: 'var(--font-family-base)',
              fontWeight: sourceFilter === val ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
              color: sourceFilter === val ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBlockEnd: sourceFilter === val ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBlockEnd: -1,
              transition: 'color var(--transition-fast)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-3)' }}>
        <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
          الكل <span className="filter-chip-count">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {SALES_INVOICE_STATUS_LABELS[s]}
            {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
          </button>
        ))}
      </div>

      {/* Search + date */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minInlineSize: 180 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="form-input" placeholder="بحث بالرقم أو العميل..."
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
            onClick={() => { setSearch(''); setStatusFilter('all'); setSourceFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} فاتورة محددة</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>تصدير PDF</button>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>اعتماد المحدد</button>
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
                <th>رقم الفاتورة</th>
                <th className="sort-th" onClick={() => sort('customerName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} /></div>
                </th>
                <th>المصدر</th>
                <th className="sort-th" onClick={() => sort('totalAmount')} style={{ cursor: 'pointer', textAlign: 'end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>الإجمالي <SortIcon active={sortKey === 'totalAmount'} dir={sortDir} /></div>
                </th>
                <th style={{ textAlign: 'end' }}>المدفوع</th>
                <th style={{ textAlign: 'end' }}>المتبقي</th>
                <th className="sort-th" onClick={() => sort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('issueDate')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>التاريخ <SortIcon active={sortKey === 'issueDate'} dir={sortDir} /></div>
                </th>
                <th>الاستحقاق</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={11} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>لا توجد فواتير تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(inv => <InvoiceRow key={inv.id} inv={inv} selected={selected.has(inv.id)} onToggle={() => toggle(inv.id)} />)}
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

function InvoiceRow({ inv, selected, onToggle }: { inv: SalesInvoice; selected: boolean; onToggle: () => void }) {
  const remaining = inv.totalAmount - inv.paidAmount;
  const overdue   = inv.status === 'posted' && remaining > 0 && inv.dueDateIso < '2026-05-25';
  return (
    <tr className={selected ? 'row-selected' : undefined}>
      <td><input type="checkbox" checked={selected} onChange={onToggle} /></td>
      <td>
        <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'inline-block' }}>
          {inv.invoiceNumber}
        </span>
        {inv.referenceOrderId && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', direction: 'ltr' }}>
            {inv.referenceOrderId}
          </div>
        )}
      </td>
      <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {inv.customerName}
      </td>
      <td>
        <span className={`status-badge ${SOURCE_CLS[inv.source]}`} style={{ fontSize: '0.625rem' }}>
          {SALES_INVOICE_SOURCE_LABELS[inv.source]}
        </span>
      </td>
      <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
        {fNum(inv.totalAmount)} <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{inv.currency}</span>
      </td>
      <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: 'var(--color-status-active)' }}>
        {fNum(inv.paidAmount)}
      </td>
      <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
        {remaining === 0
          ? <span style={{ color: 'var(--color-status-active)' }}>مُسوَّى ✓</span>
          : <span style={{ color: overdue ? 'var(--color-status-rejected)' : '#b45309' }}>{fNum(remaining)}</span>
        }
      </td>
      <td>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <InvoiceStatusBadge status={inv.status} />
          {overdue && <span style={{ fontSize: '0.6rem', color: 'var(--color-status-rejected)', fontWeight: 'var(--font-weight-semibold)' }}>متأخرة</span>}
        </div>
      </td>
      <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {fDate(inv.issueDateIso, true)}
      </td>
      <td style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap', color: overdue ? 'var(--color-status-rejected)' : 'var(--color-text-muted)' }}>
        {fDate(inv.dueDateIso, true)}
      </td>
      <td>
        <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}>عرض</button>
      </td>
    </tr>
  );
}
