'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  mockOrders,
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type Order,
} from '@/lib/mock-data';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

const PAGE_SIZE = 10;

type SortKey = 'orderDate' | 'totalAmount' | 'paidAmount' | 'customerName' | 'status';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ marginInlineStart: 4, opacity: active ? 1 : 0.3, flexShrink: 0 }}
    >
      {active && dir === 'asc'
        ? <polyline points="18 15 12 9 6 15" />
        : <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

const ALL_STATUSES: OrderStatus[] = [
  'draft', 'confirmed', 'processing', 'shipped',
  'delivered', 'completed', 'cancelled', 'returned',
];

export default function OrdersPage() {
  const { locale } = useParams<{ locale: string }>();

  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [selected,     setSelected]     = useState<Set<string>>(new Set());
  const [sortKey,      setSortKey]      = useState<SortKey>('orderDate');
  const [sortDir,      setSortDir]      = useState<'asc' | 'desc'>('desc');
  const [page,         setPage]         = useState(1);

  const filtered = useMemo(() => {
    let list = [...mockOrders];

    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.product.toLowerCase().includes(q) ||
        (o.externalOrderId ?? '').toLowerCase().includes(q),
      );
    }
    if (dateFrom) list = list.filter(o => o.orderDateIso >= dateFrom);
    if (dateTo)   list = list.filter(o => o.orderDateIso <= dateTo);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'orderDate')    cmp = a.orderDateIso.localeCompare(b.orderDateIso);
      if (sortKey === 'totalAmount')  cmp = a.totalAmount - b.totalAmount;
      if (sortKey === 'paidAmount')   cmp = a.paidAmount - b.paidAmount;
      if (sortKey === 'customerName') cmp = a.customerName.localeCompare(b.customerName);
      if (sortKey === 'status')       cmp = a.status.localeCompare(b.status);
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
    else setSelected(new Set(pageData.map(o => o.id)));
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  const hasFilters = statusFilter !== 'all' || search || dateFrom || dateTo;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: mockOrders.length };
    ALL_STATUSES.forEach(s => {
      counts[s] = mockOrders.filter(o => o.status === s).length;
    });
    return counts;
  }, []);

  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">الطلبات</h2>
          <p className="page-subtitle">{filtered.length} طلب</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
          <Link href={`/${locale}/sales/orders/new`} className="btn-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            طلب جديد
          </Link>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            className={`filter-chip${statusFilter === 'all' ? ' active' : ''}`}
            onClick={() => { setStatusFilter('all'); setPage(1); }}
          >
            الكل
            <span className="filter-chip-count">{statusCounts.all}</span>
          </button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              className={`filter-chip${statusFilter === s ? ' active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {ORDER_STATUS_LABELS[s]}
              {(statusCounts[s] ?? 0) > 0 && <span className="filter-chip-count">{statusCounts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Search + date filters */}
      <div className="leads-toolbar" style={{ marginBlockEnd: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flex: 1, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minInlineSize: 200 }}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="بحث بالرقم، العميل، المنتج..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>من</span>
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} size="sm" />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>إلى</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} size="sm" />
          </div>
        </div>
        {hasFilters && (
          <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)' }} onClick={clearFilters}>
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="bulk-bar" style={{ marginBlockEnd: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
            {selected.size} طلب محدد
          </span>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}>تصدير المحدد</button>
            <button
              className="btn-ghost"
              style={{ fontSize: 'var(--font-size-sm)', blockSize: 32, paddingInline: 'var(--space-3)' }}
              onClick={() => setSelected(new Set())}
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={pageData.length > 0 && selected.size === pageData.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="sort-th" onClick={() => sort('orderDate')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    رقم الطلب <SortIcon active={sortKey === 'orderDate'} dir={sortDir} />
                  </div>
                </th>
                <th className="sort-th" onClick={() => sort('customerName')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    العميل <SortIcon active={sortKey === 'customerName'} dir={sortDir} />
                  </div>
                </th>
                <th>المنتج</th>
                <th className="sort-th" onClick={() => sort('totalAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    الإجمالي <SortIcon active={sortKey === 'totalAmount'} dir={sortDir} />
                  </div>
                </th>
                <th className="sort-th" onClick={() => sort('paidAmount')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    المدفوع <SortIcon active={sortKey === 'paidAmount'} dir={sortDir} />
                  </div>
                </th>
                <th className="sort-th" onClick={() => sort('status')}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    الحالة <SortIcon active={sortKey === 'status'} dir={sortDir} />
                  </div>
                </th>
                <th>التاريخ</th>
                <th>المندوب</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="table-empty-cell">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
                      </svg>
                      <span>لا توجد طلبات تطابق البحث</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pageData.map(order => <OrderRow key={order.id} order={order} locale={locale} selected={selected.has(order.id)} onToggle={() => toggle(order.id)} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="leads-pagination">
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                className="pagination-page"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}
              >
                ›
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`pagination-page${p === page ? ' active' : ''}`}
                  onClick={() => setPage(p)}
                  style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: p === page ? 'var(--color-primary)' : 'none', color: p === page ? '#fff' : 'inherit', cursor: 'pointer', fontFamily: 'var(--font-family-base)' }}
                >
                  {p}
                </button>
              ))}
              <button
                className="pagination-page"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{ blockSize: 32, inlineSize: 32, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1 }}
              >
                ‹
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function OrderRow({
  order, locale, selected, onToggle,
}: {
  order: Order; locale: string; selected: boolean; onToggle: () => void;
}) {
  const remaining = order.totalAmount - order.paidAmount;

  return (
    <tr className={selected ? 'row-selected' : undefined}>
      <td><input type="checkbox" checked={selected} onChange={onToggle} /></td>
      <td>
        <div>
          <Link href={`/${locale}/sales/orders/${order.id}`} className="lead-order-link">
            {order.orderNumber}
          </Link>
          {order.externalOrderId && (
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>
              {order.externalOrderId}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="lead-customer-cell">
          <span className="lead-customer-name">{order.customerName}</span>
          <span className="lead-customer-phone">{order.phone}</span>
        </div>
      </td>
      <td>
        <div>
          <span style={{ fontSize: 'var(--font-size-sm)' }}>{order.product}</span>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            الكمية: {order.quantity}
          </div>
        </div>
      </td>
      <td style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {fNum(order.totalAmount)} {order.currency}
      </td>
      <td style={{ whiteSpace: 'nowrap' }}>
        {remaining === 0 ? (
          <span style={{ color: 'var(--color-status-active)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>مُسوَّى ✓</span>
        ) : (
          <span style={{ color: '#b45309', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)' }}>
            {fNum(order.paidAmount)} / {fNum(order.totalAmount)}
          </span>
        )}
      </td>
      <td><OrderStatusBadge status={order.status} /></td>
      <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        {order.orderDate}
      </td>
      <td style={{ fontSize: 'var(--font-size-sm)' }}>{order.assignedTo ?? '—'}</td>
      <td>
        <Link
          href={`/${locale}/sales/orders/${order.id}`}
          className="btn-ghost"
          style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
        >
          عرض
        </Link>
      </td>
    </tr>
  );
}
