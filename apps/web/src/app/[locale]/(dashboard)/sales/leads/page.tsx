'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Lead, LeadStatus } from '@/lib/mock-data';
import { mockLeads, LEAD_STATUS_LABELS, LEAD_PAYMENT_LABELS } from '@/lib/mock-data';
import LeadStatusBadge from '@/components/leads/LeadStatusBadge';
import { fNum } from '@/lib/format';

const STATUS_FILTERS: { value: 'all' | LeadStatus; label: string }[] = [
  { value: 'all',         label: 'الكل' },
  { value: 'new',         label: 'جديد' },
  { value: 'in_progress', label: 'قيد المعالجة' },
  { value: 'pending',     label: 'معلق' },
  { value: 'won',         label: 'مُحوّل' },
  { value: 'lost',        label: 'خسارة' },
  { value: 'cancelled',   label: 'ملغي' },
];

type SortKey = 'externalOrderId' | 'customerName' | 'paidAmount' | 'orderDate' | 'status';

const PAGE_SIZE = 10;

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.3, transform: active && dir === 'asc' ? 'scaleY(-1)' : 'none', flexShrink: 0 }}>
      <path d="M6 8.5 1.5 4h9L6 8.5z" />
    </svg>
  );
}

export default function LeadsPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('orderDate');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let data = [...mockLeads];

    if (statusFilter !== 'all') {
      data = data.filter(l => l.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(l =>
        l.customerName.includes(q) ||
        l.externalOrderId.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.product.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const av = sortKey === 'paidAmount' ? a[sortKey] : String(a[sortKey] ?? '').toLowerCase();
      const bv = sortKey === 'paidAmount' ? b[sortKey] : String(b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allPageSelected = paged.length > 0 && paged.every(l => selected.has(l.id));

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allPageSelected) paged.forEach(l => next.delete(l.id));
      else paged.forEach(l => next.add(l.id));
      return next;
    });
  }

  function changeFilter(value: 'all' | LeadStatus) {
    setStatusFilter(value);
    setPage(1);
    setSelected(new Set());
  }

  const statusCounts = useMemo(() =>
    mockLeads.reduce<Partial<Record<LeadStatus, number>>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {}),
  []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">العملاء المحتملون</h2>
          <p className="page-subtitle">
            {filtered.length} نتيجة
            {statusFilter !== 'all' && ` · ${LEAD_STATUS_LABELS[statusFilter]}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-outline" title="استيراد من Excel" disabled>
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
          <Link href={`/${locale}/sales/leads/new`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            عميل محتمل جديد
          </Link>
        </div>
      </div>

      {/* Toolbar: filter chips + search */}
      <div className="leads-toolbar">
        <div className="leads-filter-chips">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-chip${statusFilter === f.value ? ' active' : ''}`}
              onClick={() => changeFilter(f.value)}
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
            placeholder="البحث بالاسم، رقم الطلب، الهاتف…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span>تم تحديد <strong>{selected.size}</strong> عنصر</span>
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
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    aria-label="تحديد الكل"
                    style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </th>
                <th className="sort-th" onClick={() => toggleSort('externalOrderId')}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  رقم الطلب <SortIcon active={sortKey === 'externalOrderId'} dir={sortDir} />
                </th>
                <th className="sort-th" onClick={() => toggleSort('customerName')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} />
                  </span>
                </th>
                <th>المنتج</th>
                <th>البلد / المدينة</th>
                <th className="sort-th" onClick={() => toggleSort('paidAmount')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    المبلغ <SortIcon active={sortKey === 'paidAmount'} dir={sortDir} />
                  </span>
                </th>
                <th>طريقة الدفع</th>
                <th className="sort-th" onClick={() => toggleSort('status')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} />
                  </span>
                </th>
                <th className="sort-th" onClick={() => toggleSort('orderDate')}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    التاريخ <SortIcon active={sortKey === 'orderDate'} dir={sortDir} />
                  </span>
                </th>
                <th style={{ inlineSize: 88 }}></th>
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
              ) : paged.map(lead => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  locale={locale}
                  selected={selected.has(lead.id)}
                  onToggle={() => toggleSelect(lead.id)}
                />
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
                disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                السابق
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pagination-page${page === p ? ' active' : ''}`}
                  onClick={() => setPage(p)}>
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

function LeadRow({ lead, locale, selected, onToggle }: {
  lead: Lead;
  locale: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr className={selected ? 'row-selected' : ''}>
      <td style={{ paddingInline: 'var(--space-3)', inlineSize: 44 }}>
        <input type="checkbox" checked={selected} onChange={onToggle}
          style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
          aria-label={`تحديد ${lead.customerName}`} />
      </td>
      <td>
        <Link href={`/${locale}/sales/leads/${lead.id}`} className="lead-order-link">
          {lead.externalOrderId || '—'}
        </Link>
      </td>
      <td>
        <div className="lead-customer-cell">
          <span className="lead-customer-name">{lead.customerName}</span>
          <span className="lead-customer-phone">{lead.phone}</span>
        </div>
      </td>
      <td>
        <div className="lead-product-cell">
          <span className="lead-product-name">{lead.product}</span>
          <span className="lead-product-qty">× {lead.quantity} وحدة</span>
        </div>
      </td>
      <td>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{lead.country}</span>
        {lead.city && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}> · {lead.city}</span>
        )}
      </td>
      <td className="num">
        {fNum(lead.paidAmount)} {lead.currency}
      </td>
      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {LEAD_PAYMENT_LABELS[lead.paymentMethod]}
      </td>
      <td><LeadStatusBadge status={lead.status} /></td>
      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
        {lead.orderDate}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 'var(--space-1)', justifyContent: 'flex-end' }}>
          <Link href={`/${locale}/sales/leads/${lead.id}`} className="btn-ghost"
            style={{ padding: '6px', borderRadius: 'var(--radius-md)' }} title="عرض التفاصيل">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
          <Link href={`/${locale}/sales/leads/${lead.id}/edit`} className="btn-ghost"
            style={{ padding: '6px', borderRadius: 'var(--radius-md)' }} title="تعديل">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </Link>
        </div>
      </td>
    </tr>
  );
}
