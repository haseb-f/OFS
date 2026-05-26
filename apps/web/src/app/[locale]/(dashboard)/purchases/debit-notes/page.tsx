'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  mockDebitNotes,
  DN_STATUS_LABELS,
  type DnStatus,
} from '@/lib/purchasing-mock-data';
import { DnBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';

const PAGE_SIZE = 10;
const ALL_STATUSES: DnStatus[] = ['draft', 'approved', 'paid', 'cancelled'];

type SortKey = 'dnNumber' | 'totalAmount' | 'issueDate' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
    </svg>
  );
}

export default function DebitNotesPage() {
  useParams<{ locale: string }>();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<DnStatus | 'all'>('all');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('issueDate');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockDebitNotes];
    if (statusFilter !== 'all') list = list.filter(d => d.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(d =>
        d.dnNumber.toLowerCase().includes(q) ||
        d.vendorName.toLowerCase().includes(q) ||
        d.reason.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'dnNumber')    cmp = a.dnNumber.localeCompare(b.dnNumber);
      if (sortKey === 'totalAmount') cmp = a.totalAmount - b.totalAmount;
      if (sortKey === 'issueDate')   cmp = a.issueDateIso.localeCompare(b.issueDateIso);
      if (sortKey === 'status')      cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, sortKey, sortDir]);

  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
    setPage(1);
  }

  function toggleAll() {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map(d => d.id)));
  }

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: mockDebitNotes.length };
    ALL_STATUSES.forEach(s => { c[s] = mockDebitNotes.filter(d => d.status === s).length; });
    return c;
  }, []);

  const hasFilters = statusFilter !== 'all' || search;
  const totalPending = filtered.filter(d => d.status === 'approved').reduce((s, d) => s + d.totalAmount, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">إشعارات مدينة</h2>
          <p className="page-subtitle">{filtered.length} إشعار</p>
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
            إشعار مدين جديد
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-5)',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-lg)', marginBlockEnd: 'var(--space-5)',
        fontSize: 'var(--font-size-sm)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span style={{ color: '#1e40af' }}>
          الإشعارات المدينة تُستخدم لاسترداد مبالغ من الموردين بسبب مرتجعات أو مخالفات أو تعديلات تعاقدية.
        </span>
        {totalPending > 0 && (
          <span style={{ marginInlineStart: 'auto', color: '#b45309', fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
            مستحق: {fNum(totalPending)} ر.س
          </span>
        )}
      </div>

      {/* Status chips */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`} onClick={() => { setStatusFilter('all'); setPage(1); }}>
            الكل <span className="filter-chip-count">{statusCounts.all}</span>
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} className={`filter-chip${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setPage(1); }}>
              {DN_STATUS_LABELS[s]}
              {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxInlineSize: 400 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" className="form-input" placeholder="بحث بالرقم، المورد، السبب..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }} />
        </div>
        {hasFilters && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => { setSearch(''); setStatusFilter('all'); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} إشعار محدد</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>اعتماد</button>
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
                <th className="sort-th" onClick={() => sort('dnNumber')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>رقم الإشعار <SortIcon active={sortKey === 'dnNumber'} dir={sortDir} /></div>
                </th>
                <th>المورد</th>
                <th>السبب</th>
                <th className="sort-th" onClick={() => sort('totalAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>المبلغ <SortIcon active={sortKey === 'totalAmount'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('issueDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>تاريخ الإصدار <SortIcon active={sortKey === 'issueDate'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} /></div>
                </th>
                <th style={{ inlineSize: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={8} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <span>لا توجد إشعارات مدينة تطابق البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(dn => (
                <tr key={dn.id} className={selected.has(dn.id) ? 'row-selected' : undefined}>
                  <td><input type="checkbox" checked={selected.has(dn.id)} onChange={() => toggle(dn.id)} /></td>
                  <td><span className="lead-order-link">{dn.dnNumber}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{dn.vendorName}</td>
                  <td>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>{dn.reason}</div>
                      {dn.notes && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', maxInlineSize: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dn.notes}</div>}
                    </div>
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                    {fNum(dn.totalAmount)} {dn.currency}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{dn.issueDate}</td>
                  <td><DnBadge status={dn.status} /></td>
                  <td>
                    {dn.status === 'approved' && (
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>تسوية</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
