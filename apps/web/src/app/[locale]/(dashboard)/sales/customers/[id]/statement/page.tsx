'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockCustomers, mockStatementEntries } from '@/lib/mock-data';
import type { StatementEntry } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

const TYPE_LABELS: Record<StatementEntry['type'], string> = {
  invoice:     'فاتورة',
  payment:     'دفعة',
  credit_note: 'إشعار دائن',
  debit_note:  'إشعار مدين',
  return:      'مرتجع',
};

function BalanceCell({ value }: { value: number }) {
  if (value === 0)
    return <span className="statement-balance-zero">{fNum(0)}</span>;
  if (value > 0)
    return <span className="statement-balance-positive">{fNum(value)}</span>;
  return <span className="statement-balance-negative">({fNum(Math.abs(value))})</span>;
}

function fmt(n: number) {
  return n === 0 ? '—' : fNum(n);
}

export default function CustomerStatementPage() {
  const params  = useParams();
  const locale  = params.locale as string;
  const id      = params.id as string;

  const customer = mockCustomers.find(c => c.id === id);
  if (!customer) notFound();

  const allEntries = mockStatementEntries[id] ?? [];
  const openingEntry = allEntries[0];
  const txEntries    = allEntries.slice(1);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  // For mock data, filtering is visual-only — show all entries
  const entries = txEntries;

  const totalDebitVal  = useMemo(() => entries.reduce((s, e) => s + e.debit,  0), [entries]);
  const totalCreditVal = useMemo(() => entries.reduce((s, e) => s + e.credit, 0), [entries]);
  const closingBalance = entries.length > 0 ? (entries[entries.length - 1]?.balance ?? 0) : (openingEntry?.balance ?? 0);
  const openingBalance = openingEntry?.balance ?? 0;

  const initial = customer.nameAr.trim().charAt(0);

  return (
    <>
      {/* Page header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <Link href={`/${locale}/sales/customers/${id}`} className="btn-ghost"
            style={{ marginBlockStart: 6, padding: '6px 8px', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            رجوع
          </Link>
          <div>
            <h2 className="page-title">كشف حساب</h2>
            <p className="page-subtitle">{customer.nameAr} · {customer.code}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
          <button className="btn-outline" onClick={() => window.print()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            طباعة
          </button>
          <button className="btn-outline">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير PDF
          </button>
        </div>
      </div>

      <div className="statement-layout">

        {/* Customer info + period bar */}
        <div className="ofs-card">
          {/* Customer profile strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', padding: 'var(--space-5) var(--space-6)', borderBlockEnd: '1px solid var(--color-border-subtle)' }}>
            <div style={{
              inlineSize: 48, blockSize: 48, borderRadius: 'var(--radius-lg)',
              background: customer.type === 'company' ? 'linear-gradient(135deg,#16a34a,#166534)' : customer.type === 'government' ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)',
              flexShrink: 0, boxShadow: 'var(--shadow-sm)',
            }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginBlockEnd: 2 }}>
                {customer.nameAr}
              </p>
              {customer.nameEn && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{customer.nameEn}</p>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginBlockStart: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.code}</span>
                {customer.phone && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', direction: 'ltr' }}>{customer.phone}</span>
                )}
                {customer.city && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.city}، {customer.country}</span>
                )}
              </div>
            </div>
            {customer.taxNumber && (
              <div style={{ textAlign: 'end' }}>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الرقم الضريبي</p>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums', direction: 'ltr' }}>
                  {customer.taxNumber}
                </p>
              </div>
            )}
          </div>

          {/* Date range filter */}
          <div className="statement-period-bar">
            <span className="statement-period-label">الفترة الزمنية:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <OfsDatePicker value={dateFrom} onChange={setDateFrom} size="sm" />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>إلى</span>
              <OfsDatePicker value={dateTo} onChange={setDateTo} size="sm" />
            </div>
            <button className="btn-outline" style={{ blockSize: 36, fontSize: 'var(--font-size-sm)' }}>
              تطبيق
            </button>
            {(dateFrom || dateTo) && (
              <button className="btn-ghost" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}
                onClick={() => { setDateFrom(''); setDateTo(''); }}>
                مسح
              </button>
            )}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              تاريخ الطباعة: 24 مايو 2026
            </span>
          </div>
        </div>

        {/* Summary cards */}
        <div className="statement-summary-row ofs-card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
          <div className="statement-summary-cell">
            <span className="statement-summary-label">رصيد الافتتاح</span>
            <span className="statement-summary-value num" style={{ color: openingBalance > 0 ? 'var(--color-status-pending)' : 'var(--color-status-active)' }}>
              {fNum(openingBalance)}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
          </div>
          <div className="statement-summary-cell">
            <span className="statement-summary-label">إجمالي المدين</span>
            <span className="statement-summary-value num" style={{ color: 'var(--color-status-rejected)' }}>
              {fNum(totalDebitVal)}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
          </div>
          <div className="statement-summary-cell">
            <span className="statement-summary-label">إجمالي الدائن</span>
            <span className="statement-summary-value num" style={{ color: 'var(--color-status-active)' }}>
              {fNum(totalCreditVal)}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
          </div>
          <div className="statement-summary-cell">
            <span className="statement-summary-label">الرصيد الختامي</span>
            <span className="statement-summary-value num" style={{ color: closingBalance === 0 ? 'var(--color-status-active)' : 'var(--color-status-pending)' }}>
              {fNum(closingBalance)}
            </span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{customer.currency}</span>
          </div>
        </div>

        {/* Statement table */}
        <div className="ofs-card">
          <div className="ofs-table-wrap">
            <table className="ofs-table statement-table" style={{ minInlineSize: 780 }}>
              <thead>
                <tr>
                  <th style={{ inlineSize: 130 }}>التاريخ</th>
                  <th style={{ inlineSize: 140 }}>المرجع</th>
                  <th>البيان</th>
                  <th style={{ textAlign: 'end', inlineSize: 140 }}>مدين</th>
                  <th style={{ textAlign: 'end', inlineSize: 140 }}>دائن</th>
                  <th style={{ textAlign: 'end', inlineSize: 160 }}>الرصيد</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening balance row */}
                {openingEntry && (
                  <tr className="row-opening">
                    <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>—</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>—</td>
                    <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>رصيد مرحّل من الفترة السابقة</td>
                    <td className="col-balance" style={{ textAlign: 'end' }}>—</td>
                    <td className="col-balance" style={{ textAlign: 'end' }}>—</td>
                    <td style={{ textAlign: 'end' }}>
                      <BalanceCell value={openingEntry.balance} />
                    </td>
                  </tr>
                )}

                {/* Transaction rows */}
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty-cell">
                      لا توجد حركات في هذه الفترة
                    </td>
                  </tr>
                ) : entries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>
                      {entry.date}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <span className={`stmt-type-badge stmt-type-${entry.type}`}>
                          {TYPE_LABELS[entry.type]}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontVariantNumeric: 'tabular-nums', color: 'var(--color-text)', fontWeight: 'var(--font-weight-medium)', direction: 'ltr' }}>
                          {entry.reference}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                      {entry.descriptionAr}
                    </td>
                    <td className={entry.debit === 0 ? 'col-debit-zero col-debit' : 'col-debit'}>
                      {fmt(entry.debit)}
                    </td>
                    <td className={entry.credit === 0 ? 'col-credit-zero col-credit' : 'col-credit'}>
                      {fmt(entry.credit)}
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <BalanceCell value={entry.balance} />
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                {entries.length > 0 && (
                  <tr className="row-total">
                    <td colSpan={3} style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                      الإجمالي
                    </td>
                    <td className="col-debit" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {fNum(totalDebitVal)}
                    </td>
                    <td className="col-credit" style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {fNum(totalCreditVal)}
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <BalanceCell value={closingBalance} />
                    </td>
                  </tr>
                )}

                {/* Closing balance row */}
                {entries.length > 0 && (
                  <tr className="row-closing">
                    <td colSpan={5} style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
                      الرصيد الختامي
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-text-muted)', marginInlineStart: 8 }}>
                        {customer.currency}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end', fontSize: 'var(--font-size-base)' }}>
                      <BalanceCell value={closingBalance} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Statement footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: 'var(--space-4) var(--space-6)',
            borderBlockStart: '1px solid var(--color-border-subtle)',
            flexWrap: 'wrap', gap: 'var(--space-3)',
          }}>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              * الأرقام بـ {customer.currency} · الرصيد الموجب = مستحق على العميل · الرصيد بين قوسين = رصيد دائن
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              صدر بتاريخ: 24 مايو 2026 · OFS — نظام إدارة الطلبات
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
