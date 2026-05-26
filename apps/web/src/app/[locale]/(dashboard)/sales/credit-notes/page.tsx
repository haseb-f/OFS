'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockCreditNotes, CREDIT_NOTE_STATUS_LABELS,
  type CreditNoteStatus,
} from '@/lib/mock-data';
import InvoiceStatusBadge from '@/components/sales/InvoiceStatusBadge';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum, fDate } from '@/lib/format';

const PAGE_SIZE = 10;
const ALL_STATUSES: CreditNoteStatus[] = ['draft', 'approved', 'posted', 'cancelled'];

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

type SortKey = 'issueDate' | 'totalAmount' | 'customerName' | 'status';

function CreditNoteStatusBadge({ status }: { status: CreditNoteStatus }) {
  return <InvoiceStatusBadge status={status as any} />;
}

export default function CreditNotesPage() {
  const { locale: _locale } = useParams<{ locale: string }>();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<CreditNoteStatus | 'all'>('all');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('issueDate');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockCreditNotes];
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(x => x.creditNoteNumber.toLowerCase().includes(q) || x.customerName.toLowerCase().includes(q) || x.invoiceRef.toLowerCase().includes(q));
    }
    if (dateFrom) list = list.filter(c => c.issueDateIso >= dateFrom);
    if (dateTo)   list = list.filter(c => c.issueDateIso <= dateTo);
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'issueDate')    cmp = a.issueDateIso.localeCompare(b.issueDateIso);
      if (sortKey === 'totalAmount')  cmp = a.totalAmount - b.totalAmount;
      if (sortKey === 'customerName') cmp = a.customerName.localeCompare(b.customerName);
      if (sortKey === 'status')       cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: mockCreditNotes.length };
    ALL_STATUSES.forEach(s => { c[s] = mockCreditNotes.filter(x => x.status === s).length; });
    return c;
  }, []);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }
  function toggleAll() { setSelected(selected.size === pageData.length ? new Set() : new Set(pageData.map(c => c.id))); }
  function toggle(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  const hasFilters = statusFilter !== 'all' || search || dateFrom || dateTo;
  const totalValue = filtered.reduce((s, c) => s + c.totalAmount, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">الإشعارات الدائنة</h2>
          <p className="page-subtitle">{filtered.length} إشعار · قيمة إجمالية: {fNum(totalValue)} SAR</p>
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
            إشعار دائن جديد
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: 'var(--color-primary-subtle)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)', marginBlockEnd: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
          الإشعارات الدائنة تُخفّض الرصيد المستحق على العميل وتُسجَّل كقيد محاسبي عند الترحيل.
        </span>
      </div>

      {/* Status chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-3)' }}>
        <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
          الكل <span className="filter-chip-count">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {CREDIT_NOTE_STATUS_LABELS[s]}
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
            <input type="text" className="form-input" placeholder="بحث بالرقم، العميل، الفاتورة..."
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

      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} إشعار محدد</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>اعتماد</button>
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
                <th>رقم الإشعار</th>
                <th className="sort-th" onClick={() => sort('customerName')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} /></div>
                </th>
                <th>الفاتورة المرجعية</th>
                <th className="sort-th" onClick={() => sort('totalAmount')} style={{ cursor: 'pointer', textAlign: 'end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>المبلغ <SortIcon active={sortKey === 'totalAmount'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('status')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('issueDate')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>التاريخ <SortIcon active={sortKey === 'issueDate'} dir={sortDir} /></div>
                </th>
                <th>السبب</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={9} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span>لا توجد إشعارات دائنة تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(cn => (
                <tr key={cn.id} className={selected.has(cn.id) ? 'row-selected' : undefined}>
                  <td><input type="checkbox" checked={selected.has(cn.id)} onChange={() => toggle(cn.id)} /></td>
                  <td>
                    <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', display: 'inline-block' }}>
                      {cn.creditNoteNumber}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cn.customerName}</td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)', direction: 'ltr', display: 'inline-block' }}>
                      {cn.invoiceRef}
                    </span>
                  </td>
                  <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: '#b91c1c', fontWeight: 'var(--font-weight-semibold)' }}>
                    ({fNum(cn.totalAmount)}) <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-regular)' }}>{cn.currency}</span>
                  </td>
                  <td><CreditNoteStatusBadge status={cn.status} /></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{fDate(cn.issueDateIso, true)}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', maxInlineSize: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cn.reason}</td>
                  <td><button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}>عرض</button></td>
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
