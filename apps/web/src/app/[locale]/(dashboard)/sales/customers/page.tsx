'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { CustomerStatus, CustomerType } from '@/lib/mock-data';
import { mockCustomers, CUSTOMER_STATUS_LABELS, CUSTOMER_TYPE_LABELS, TAG_COLORS } from '@/lib/mock-data';
import CustomerStatusBadge from '@/components/customers/CustomerStatusBadge';
import CustomerTypeBadge from '@/components/customers/CustomerTypeBadge';
import OfsSelect from '@/components/ui/OfsSelect';
import { fNum } from '@/lib/format';

const STATUS_FILTERS: { value: 'all' | CustomerStatus; label: string }[] = [
  { value: 'all',      label: 'الكل' },
  { value: 'active',   label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'blocked',  label: 'محظور' },
];

const TYPE_FILTERS: { value: 'all' | CustomerType; label: string }[] = [
  { value: 'all',        label: 'جميع الأنواع' },
  { value: 'company',    label: 'شركة' },
  { value: 'individual', label: 'فرد' },
  { value: 'government', label: 'جهة حكومية' },
];

type SortKey = 'code' | 'nameAr' | 'totalOrderValue' | 'outstanding' | 'totalOrders';

const PAGE_SIZE = 10;

const AVATAR_COLORS: Record<CustomerType, string> = {
  company:    'type-company',
  individual: 'type-individual',
  government: 'type-government',
};

function initials(name: string) {
  return name.trim().charAt(0);
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transform: active && dir === 'asc' ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M6 8.5 1.5 4h9L6 8.5z" />
    </svg>
  );
}

export default function CustomersPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
  const [typeFilter,   setTypeFilter]   = useState<'all' | CustomerType>('all');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('code');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('asc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockCustomers];

    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter);
    if (typeFilter   !== 'all') data = data.filter(c => c.type   === typeFilter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(c =>
        c.nameAr.includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        c.city.includes(q)
      );
    }

    data.sort((a, b) => {
      const av = sortKey === 'totalOrderValue' || sortKey === 'outstanding' || sortKey === 'totalOrders'
        ? a[sortKey]
        : String(a[sortKey] ?? '').toLowerCase();
      const bv = sortKey === 'totalOrderValue' || sortKey === 'outstanding' || sortKey === 'totalOrders'
        ? b[sortKey]
        : String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [search, statusFilter, typeFilter, sortKey, sortDir]);

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
    mockCustomers.reduce<Partial<Record<CustomerStatus, number>>>((a, c) => {
      a[c.status] = (a[c.status] ?? 0) + 1; return a;
    }, {}), []);

  function resetFilters() {
    setStatusFilter('all'); setTypeFilter('all');
    setSearch(''); setPage(1); setSelected(new Set());
  }

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">العملاء</h2>
          <p className="page-subtitle">
            {filtered.length} عميل
            {statusFilter !== 'all' && ` · ${CUSTOMER_STATUS_LABELS[statusFilter]}`}
            {typeFilter !== 'all' && ` · ${CUSTOMER_TYPE_LABELS[typeFilter]}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-outline" disabled title="استيراد من Excel">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            استيراد
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <Link href={`/${locale}/sales/customers/new`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            عميل جديد
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="leads-toolbar">
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status chips */}
          <div className="leads-filter-chips">
            {STATUS_FILTERS.map(f => (
              <button key={f.value} className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
                onClick={() => { setStatusFilter(f.value); setPage(1); }}>
                {f.label}
                {f.value !== 'all' && statusCounts[f.value] != null && (
                  <span className="filter-chip-count">{statusCounts[f.value]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Type select */}
          <OfsSelect
            options={TYPE_FILTERS.map(f => ({ value: f.value, label: f.label }))}
            value={typeFilter}
            onChange={v => { setTypeFilter(v as 'all' | CustomerType); setPage(1); }}
            size="sm"
          />

          {(statusFilter !== 'all' || typeFilter !== 'all' || search) && (
            <button className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}
              onClick={resetFilters}>
              مسح الفلاتر
            </button>
          )}
        </div>

        <div className="leads-search">
          <span className="leads-search-icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input type="search" placeholder="البحث بالاسم، الكود، الهاتف…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
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
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} aria-label="تحديد الكل" />
                </th>
                <th className="sort-th" onClick={() => toggleSort('code')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    الكود <SortIcon active={sortKey === 'code'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('nameAr')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    العميل <SortIcon active={sortKey === 'nameAr'} dir={sortDir} />
                  </span>
                </th>
                <th>الهاتف</th>
                <th>البلد / المدينة</th>
                <th className="sort-th" onClick={() => toggleSort('totalOrders')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    الطلبات <SortIcon active={sortKey === 'totalOrders'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('outstanding')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    الرصيد المستحق <SortIcon active={sortKey === 'outstanding'} dir={sortDir} />
                  </span>
                </th>
                <th>الحالة</th>
                <th>المندوب</th>
                <th style={{ inlineSize: 88 }}></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={10} className="table-empty-cell">
                    <div className="table-empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    لا توجد عملاء تطابق البحث أو الفلتر
                  </td>
                </tr>
              ) : paged.map(c => (
                <tr key={c.id} className={selected.has(c.id) ? 'row-selected' : ''}>
                  <td style={{ paddingInline: 'var(--space-3)', inlineSize: 44 }}>
                    <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)}
                      style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                  </td>
                  <td>
                    <Link href={`/${locale}/sales/customers/${c.id}`} className="lead-order-link">
                      {c.code}
                    </Link>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div className={`customer-avatar-lg ${AVATAR_COLORS[c.type]}`}
                        style={{ inlineSize: 32, blockSize: 32, borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', boxShadow: 'none', flexShrink: 0 }}>
                        {initials(c.nameAr)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                            {c.nameAr}
                          </span>
                          <CustomerTypeBadge type={c.type} />
                        </div>
                        {c.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBlockStart: 3 }}>
                            {c.tags.slice(0, 2).map(tag => {
                              const col = TAG_COLORS[tag];
                              return (
                                <span key={tag} className="tag-chip"
                                  style={{ background: col?.bg, color: col?.color, borderColor: col?.border, border: '1px solid' }}>
                                  {tag}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums', direction: 'ltr', textAlign: 'start' }}>
                    {c.phone}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>
                    <span style={{ color: 'var(--color-text)' }}>{c.country}</span>
                    {c.city && <span style={{ color: 'var(--color-text-muted)' }}> · {c.city}</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span className="num" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
                        {c.totalOrders} طلب
                      </span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {fNum(c.totalOrderValue)} {c.currency}
                      </span>
                    </div>
                  </td>
                  <td>
                    {c.outstanding === 0 ? (
                      <span className="num" style={{ color: 'var(--color-status-active)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                        مُسوَّى
                      </span>
                    ) : (
                      <span className="num" style={{ color: 'var(--color-status-pending)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                        {fNum(c.outstanding)} {c.currency}
                      </span>
                    )}
                  </td>
                  <td><CustomerStatusBadge status={c.status} /></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    {c.assignedSalesperson ?? '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
                      <Link href={`/${locale}/sales/customers/${c.id}`} className="btn-ghost"
                        style={{ padding: 6, borderRadius: 'var(--radius-md)' }} title="عرض">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </Link>
                      <Link href={`/${locale}/sales/customers/${c.id}/edit`} className="btn-ghost"
                        style={{ padding: 6, borderRadius: 'var(--radius-md)' }} title="تعديل">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
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
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-page${page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', paddingInline: 'var(--space-3)' }}
                disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>التالي</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
