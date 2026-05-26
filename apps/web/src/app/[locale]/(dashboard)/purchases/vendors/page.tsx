'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockVendors,
  VENDOR_STATUS_LABELS,
  type VendorStatus,
} from '@/lib/purchasing-mock-data';
import { VendorBadge } from '@/components/purchases/PurchaseStatusBadge';
import { fNum } from '@/lib/format';

const PAGE_SIZE = 10;
const ALL_STATUSES: VendorStatus[] = ['active', 'inactive', 'blacklisted'];

type SortKey = 'nameAr' | 'currentBalance' | 'totalPurchases' | 'lastOrderDate' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}>
      {active && dir === 'asc' ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
    </svg>
  );
}

export default function VendorsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all');
  const [cityFilter,   setCityFilter]   = useState<string>('all');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('nameAr');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [page,         setPage]         = useState(1);

  const cities = useMemo(() => [...new Set(mockVendors.map(v => v.city))].sort(), []);

  const filtered = useMemo(() => {
    let list = [...mockVendors];
    if (statusFilter !== 'all') list = list.filter(v => v.status === statusFilter);
    if (cityFilter !== 'all')   list = list.filter(v => v.city === cityFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(v =>
        v.nameAr.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q) ||
        v.phone.includes(q) ||
        v.email.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'nameAr')         cmp = a.nameAr.localeCompare(b.nameAr);
      if (sortKey === 'currentBalance') cmp = a.currentBalance - b.currentBalance;
      if (sortKey === 'totalPurchases') cmp = a.totalPurchases - b.totalPurchases;
      if (sortKey === 'lastOrderDate')  cmp = a.lastOrderDateIso.localeCompare(b.lastOrderDateIso);
      if (sortKey === 'status')         cmp = a.status.localeCompare(b.status);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [search, statusFilter, cityFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function sort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function toggleAll() {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map(v => v.id)));
  }

  function toggle(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const statusCounts = useMemo(() => {
    const c: Record<string, number> = { all: mockVendors.length };
    ALL_STATUSES.forEach(s => { c[s] = mockVendors.filter(v => v.status === s).length; });
    return c;
  }, []);

  const hasFilters = statusFilter !== 'all' || cityFilter !== 'all' || search;

  const totalBalance  = mockVendors.filter(v => v.status === 'active').reduce((s, v) => s + v.currentBalance, 0);
  const totalPurchase = mockVendors.filter(v => v.status === 'active').reduce((s, v) => s + v.totalPurchases, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">الموردون</h2>
          <p className="page-subtitle">{filtered.length} مورد</p>
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
            مورد جديد
          </button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)', marginBlockEnd: 'var(--space-5)' }}>
        {[
          { labelAr: 'موردون نشطون', value: String(statusCounts.active ?? 0), color: '#15803d', bg: '#f0fdf4' },
          { labelAr: 'إجمالي الأرصدة', value: fNum(totalBalance) + ' ر.س', color: '#b45309', bg: '#fffbeb' },
          { labelAr: 'إجمالي المشتريات', value: fNum(totalPurchase) + ' ر.س', color: '#1d4ed8', bg: '#eff6ff' },
          { labelAr: 'موردون محظورون', value: String(statusCounts.blacklisted ?? 0), color: '#b91c1c', bg: '#fef2f2' },
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
              {VENDOR_STATUS_LABELS[s]}
              {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search + city filter */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minInlineSize: 200 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" className="form-input" placeholder="بحث بالاسم، الرمز، الهاتف، البريد..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }} />
          </div>
          <select className="form-select" value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}
            style={{ blockSize: 36, flex: '0 1 160px', fontSize: 'var(--font-size-sm)' }}>
            <option value="all">كل المدن</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {hasFilters && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }}
            onClick={() => { setSearch(''); setStatusFilter('all'); setCityFilter('all'); setPage(1); }}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{selected.size} مورد محدد</span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
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
                <th className="sort-th" onClick={() => sort('nameAr')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>المورد <SortIcon active={sortKey === 'nameAr'} dir={sortDir} /></div>
                </th>
                <th>المدينة</th>
                <th>الاتصال</th>
                <th>شروط الدفع</th>
                <th className="sort-th" onClick={() => sort('currentBalance')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>الرصيد الحالي <SortIcon active={sortKey === 'currentBalance'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('totalPurchases')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>إجمالي المشتريات <SortIcon active={sortKey === 'totalPurchases'} dir={sortDir} /></div>
                </th>
                <th className="sort-th" onClick={() => sort('lastOrderDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>آخر أمر شراء <SortIcon active={sortKey === 'lastOrderDate'} dir={sortDir} /></div>
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
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    <span>لا يوجد موردون يطابقون البحث</span>
                  </div>
                </td></tr>
              ) : pageData.map(v => (
                <tr key={v.id} className={selected.has(v.id) ? 'row-selected' : undefined}>
                  <td><input type="checkbox" checked={selected.has(v.id)} onChange={() => toggle(v.id)} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{
                        inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-full)', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-green-700) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-bold)',
                      }}>
                        {v.nameAr.trim().charAt(0)}
                      </div>
                      <div>
                        <Link href={`/${locale}/purchases/vendors/${v.id}`} className="lead-order-link">{v.nameAr}</Link>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{v.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{v.city}</td>
                  <td>
                    <div className="lead-customer-cell">
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>{v.phone}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{v.email}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{v.paymentTerms}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: v.currentBalance > 0 ? '#b45309' : 'var(--color-text-muted)' }}>
                    {v.currentBalance > 0 ? fNum(v.currentBalance) + ' ر.س' : '—'}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                    {fNum(v.totalPurchases)} ر.س
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {v.lastOrderDate}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <VendorBadge status={v.status} />
                      {v.tags.map(tag => (
                        <span key={tag} style={{ fontSize: '0.6rem', fontWeight: 'var(--font-weight-semibold)', padding: '2px 6px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-green-200)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <Link href={`/${locale}/purchases/vendors/${v.id}`} className="btn-ghost" style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}>
                      عرض
                    </Link>
                  </td>
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
