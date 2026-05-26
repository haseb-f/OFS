'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockCustomers, CUSTOMER_TYPE_LABELS, type CustomerType } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

export default function CustomerStatementsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState<CustomerType | 'all'>('all');
  const [showBalance, setShowBalance] = useState<'all' | 'outstanding' | 'zero'>('all');

  const filtered = useMemo(() => {
    let list = [...mockCustomers];
    if (typeFilter !== 'all')    list = list.filter(c => c.type === typeFilter);
    if (showBalance === 'outstanding') list = list.filter(c => c.outstanding > 0);
    if (showBalance === 'zero')        list = list.filter(c => c.outstanding === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.nameAr.includes(q) || (c.nameEn?.toLowerCase().includes(q)) || c.code.toLowerCase().includes(q) || (c.phone?.includes(q)));
    }
    return list.sort((a, b) => b.outstanding - a.outstanding);
  }, [search, typeFilter, showBalance]);

  const totalOutstanding = filtered.reduce((s, c) => s + c.outstanding, 0);
  const withBalance      = filtered.filter(c => c.outstanding > 0).length;

  const TYPE_ALL = [
    ['all', 'الكل'],
    ['company', 'شركة'],
    ['individual', 'فرد'],
    ['government', 'جهة حكومية'],
  ] as [string, string][];

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">كشوفات حسابات العملاء</h2>
          <p className="page-subtitle">{filtered.length} عميل · إجمالي المستحق: {fNum(totalOutstanding)} SAR</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            طباعة الكل
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'var(--space-4)', marginBlockEnd: 'var(--space-5)' }}>
        {[
          { label: 'إجمالي العملاء', value: String(filtered.length), color: 'var(--color-text)', bg: 'var(--color-surface)', border: 'var(--color-border)' },
          { label: 'عملاء لديهم رصيد', value: String(withBalance), color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
          { label: 'إجمالي المستحق', value: fNum(totalOutstanding) + ' SAR', color: 'var(--color-status-rejected)', bg: '#fef2f2', border: '#fecaca' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--radius-xl)', padding: 'var(--space-4) var(--space-5)' }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-semibold)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBlockEnd: 'var(--space-1)' }}>{s.label}</p>
            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-4)', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minInlineSize: 180 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', insetBlockStart: '50%', insetInlineStart: 12, transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" className="form-input" placeholder="بحث بالاسم، الكود، الهاتف..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingInlineStart: 36, blockSize: 36, fontSize: 'var(--font-size-sm)' }} />
        </div>
        <select className="form-input" value={typeFilter} onChange={e => setTypeFilter(e.target.value as CustomerType | 'all')}
          style={{ blockSize: 36, fontSize: 'var(--font-size-sm)', inlineSize: 'auto', minInlineSize: 140, paddingInline: 'var(--space-3)' }}>
          {TYPE_ALL.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 'var(--space-1)', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', padding: 2, border: '1px solid var(--color-border)' }}>
          {([['all','الكل'], ['outstanding','لديهم رصيد'], ['zero','مُسوَّى']] as [string,string][]).map(([v, l]) => (
            <button key={v} onClick={() => setShowBalance(v as 'all'|'outstanding'|'zero')}
              style={{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-xs)', fontFamily: 'var(--font-family-base)', fontWeight: showBalance === v ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)', background: showBalance === v ? 'var(--color-primary)' : 'transparent', color: showBalance === v ? '#fff' : 'var(--color-text-muted)', transition: 'all var(--transition-fast)' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ofs-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>النوع</th>
                <th>الدولة</th>
                <th style={{ textAlign: 'end' }}>إجمالي الطلبات</th>
                <th style={{ textAlign: 'end' }}>إجمالي المدفوع</th>
                <th style={{ textAlign: 'end' }}>الرصيد المستحق</th>
                <th>آخر طلب</th>
                <th>المندوب</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="table-empty-cell">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <span>لا توجد نتائج</span>
                  </div>
                </td></tr>
              ) : filtered.map(customer => {
                const initial  = customer.nameAr.trim().charAt(0);
                const typeBg   = customer.type === 'company' ? 'linear-gradient(135deg,#16a34a,#166534)' : customer.type === 'government' ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)';
                return (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ inlineSize: 34, blockSize: 34, borderRadius: 'var(--radius-md)', background: typeBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)', flexShrink: 0 }}>
                          {initial}
                        </div>
                        <div>
                          <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', marginBlockEnd: 2 }}>{customer.nameAr}</p>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{customer.code}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                        {CUSTOMER_TYPE_LABELS[customer.type]}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{customer.country}</td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {fNum(customer.totalOrderValue)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: 'var(--color-status-active)' }}>
                      {fNum(customer.totalPaid)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>
                      {customer.outstanding === 0 ? (
                        <span style={{ color: 'var(--color-status-active)', fontWeight: 'var(--font-weight-semibold)' }}>مُسوَّى ✓</span>
                      ) : (
                        <span style={{ color: 'var(--color-status-rejected)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {fNum(customer.outstanding)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>{customer.currency}</span>
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {customer.lastOrderDate ?? '—'}
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                      {customer.assignedSalesperson ?? '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <Link
                          href={`/${locale}/sales/customers/${customer.id}/statement`}
                          className="btn-outline"
                          style={{ padding: '4px 10px', fontSize: 'var(--font-size-xs)' }}
                        >
                          كشف الحساب
                        </Link>
                        <Link
                          href={`/${locale}/sales/customers/${customer.id}`}
                          className="btn-ghost"
                          style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
                        >
                          ملف
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: 'var(--space-3) var(--space-5)', borderBlockStart: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            يعرض {filtered.length} عميل
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            الرصيد الموجب = مستحق على العميل · الأرقام بعملة كل عميل
          </span>
        </div>
      </div>
    </>
  );
}
