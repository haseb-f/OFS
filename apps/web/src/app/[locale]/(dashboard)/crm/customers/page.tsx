'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockCrmCustomers,
  CRM_CUSTOMER_STATUS_LABELS,
  type CrmCustomerStatus,
} from '@/lib/crm-mock-data';
import { fNum } from '@/lib/format';

type SortKey = 'code' | 'name' | 'city' | 'lastActivity' | 'totalRevenue';

const STATUS_FILTERS: { value: 'all' | CrmCustomerStatus; label: string }[] = [
  { value: 'all',      label: 'الكل' },
  { value: 'active',   label: 'نشط' },
  { value: 'prospect', label: 'مرشح' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'churned',  label: 'مفقود' },
];

const STATUS_COLORS: Record<CrmCustomerStatus, { bg: string; color: string }> = {
  active:   { bg: '#f0fdf4', color: '#15803d' },
  prospect: { bg: '#eff6ff', color: '#1d4ed8' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
  churned:  { bg: '#fef2f2', color: '#b91c1c' },
};

const PAGE_SIZE = 10;

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transform: active && dir === 'asc' ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M6 8.5 1.5 4h9L6 8.5z" />
    </svg>
  );
}

export default function CrmCustomersPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CrmCustomerStatus>('all');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('name');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockCrmCustomers];
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(c =>
        c.name.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.includes(q)
      );
    }
    data.sort((a, b) => {
      const av = sortKey === 'totalRevenue' ? a[sortKey] : String(a[sortKey] ?? '').toLowerCase();
      const bv = sortKey === 'totalRevenue' ? b[sortKey] : String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const allPageSelected = paged.length > 0 && paged.every(c => selected.has(c.id));
  function toggleAll() {
    setSelected(prev => {
      const n = new Set(prev);
      if (allPageSelected) paged.forEach(c => n.delete(c.id));
      else paged.forEach(c => n.add(c.id));
      return n;
    });
  }

  const statusCounts = useMemo(() =>
    mockCrmCustomers.reduce<Partial<Record<CrmCustomerStatus, number>>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {}),
  []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">العملاء</h2>
          <p className="page-subtitle">
            {filtered.length} عميل
            {statusFilter !== 'all' && ` · ${CRM_CUSTOMER_STATUS_LABELS[statusFilter]}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button className="btn-outline" disabled>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <button className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            عميل جديد
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="leads-toolbar">
        <div className="leads-filter-chips">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
              onClick={() => { setStatusFilter(f.value); setPage(1); setSelected(new Set()); }}
            >
              {f.label}
              {f.value !== 'all' && statusCounts[f.value] != null && (
                <span className="filter-chip-count">{statusCounts[f.value]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="leads-search">
          <span className="leads-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="search"
            placeholder="البحث بالاسم أو الكود أو الهاتف أو المدينة…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>تم تحديد <strong>{selected.size}</strong> عميل</span>
          <div className="bulk-bar-spacer" />
          <button className="btn-ghost" onClick={() => setSelected(new Set())}>إلغاء التحديد</button>
          <button className="btn-outline" style={{ color: 'var(--color-status-rejected)', borderColor: 'var(--color-status-rejected)' }}>
            حذف المحدد
          </button>
        </div>
      )}

      {/* Table */}
      <div className="ofs-card">
        <div className="ofs-table-wrap">
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ inlineSize: 44, paddingInline: 'var(--space-3)' }}>
                  <input type="checkbox" checked={allPageSelected} onChange={toggleAll}
                    aria-label="تحديد الكل"
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                </th>
                <th className="sort-th" onClick={() => toggleSort('code')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    كود العميل <SortIcon active={sortKey === 'code'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('name')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    اسم العميل <SortIcon active={sortKey === 'name'} dir={sortDir} />
                  </span>
                </th>
                <th>الهاتف</th>
                <th className="sort-th" onClick={() => toggleSort('city')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    المدينة <SortIcon active={sortKey === 'city'} dir={sortDir} />
                  </span>
                </th>
                <th>الحالة</th>
                <th>المسؤول</th>
                <th className="sort-th" onClick={() => toggleSort('lastActivity')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    آخر نشاط <SortIcon active={sortKey === 'lastActivity'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('totalRevenue')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    إجمالي الإيرادات <SortIcon active={sortKey === 'totalRevenue'} dir={sortDir} />
                  </span>
                </th>
                <th style={{ inlineSize: 64 }}></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="table-empty-cell">
                    <div className="table-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    لا توجد نتائج تطابق البحث أو الفلتر المحدد
                  </td>
                </tr>
              ) : paged.map(customer => {
                const sc = STATUS_COLORS[customer.status];
                return (
                  <tr key={customer.id} className={selected.has(customer.id) ? 'row-selected' : ''}>
                    <td style={{ paddingInline: 'var(--space-3)', inlineSize: 44 }}>
                      <input type="checkbox" checked={selected.has(customer.id)} onChange={() => toggleSelect(customer.id)}
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                        aria-label={`تحديد ${customer.name}`} />
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-family-base)', letterSpacing: '0.02em' }}>
                        {customer.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{
                          inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-full)',
                          background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                          flexShrink: 0,
                        }}>
                          {customer.name.charAt(0)}
                        </span>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                            {customer.name}
                          </div>
                          {customer.email && (
                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr' }}>{customer.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', direction: 'ltr', whiteSpace: 'nowrap' }}>
                      {customer.phone}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{customer.city}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        paddingInline: 'var(--space-2)', paddingBlock: '2px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)',
                        background: sc.bg, color: sc.color,
                      }}>
                        {CRM_CUSTOMER_STATUS_LABELS[customer.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{
                          inlineSize: 26, blockSize: 26, borderRadius: 'var(--radius-full)',
                          background: 'var(--color-surface-overlay)', color: 'var(--color-text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-bold)',
                          flexShrink: 0,
                        }}>
                          {customer.assignedUserInitials}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{customer.assignedUser}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {customer.lastActivity}
                    </td>
                    <td className="num">
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {fNum(customer.totalRevenue, 0)}
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
                        {customer.totalOrders} طلب
                      </div>
                    </td>
                    <td>
                      <Link href={`/${locale}/crm/customers/${customer.id}`} className="btn-ghost"
                        style={{ padding: '6px', borderRadius: 'var(--radius-md)' }} title="عرض الملف الشخصي">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="leads-pagination">
            <span className="pagination-info">
              عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div className="pagination-controls">
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', paddingInline: 'var(--space-3)' }}
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-page${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </button>
              ))}
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', paddingInline: 'var(--space-3)' }}
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
