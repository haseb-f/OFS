'use client';

import { useMemo, useState } from 'react';
import { mockAccounts, ACCOUNT_TYPE_LABELS, type AccountType } from '@/lib/mock-data';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const TYPE_CLASS: Record<AccountType, string> = {
  asset:     'account-type-asset',
  liability: 'account-type-liability',
  equity:    'account-type-equity',
  revenue:   'account-type-revenue',
  expense:   'account-type-expense',
};

export default function TrialBalancePage() {
  const [asOf, setAsOf]           = useState('2026-05-25');
  const [search, setSearch]       = useState('');
  const [showHeaders, setShowHeaders] = useState(false);

  const rows = useMemo(() => {
    let data = mockAccounts.filter(a => showHeaders || !a.isHeader);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(a => a.nameAr.includes(q) || a.code.includes(q));
    }
    return data;
  }, [showHeaders, search]);

  const leafRows = mockAccounts.filter(a => !a.isHeader);

  const totalDebit  = leafRows.reduce((s, a) => s + (a.nature === 'debit'  && a.balance > 0 ? a.balance  : a.nature === 'credit' && a.balance < 0 ? Math.abs(a.balance) : 0), 0);
  const totalCredit = leafRows.reduce((s, a) => s + (a.nature === 'credit' && a.balance > 0 ? a.balance  : a.nature === 'debit'  && a.balance < 0 ? Math.abs(a.balance) : 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.01;

  function getDebit(balance: number, nature: string) {
    if (nature === 'debit'  && balance > 0) return balance;
    if (nature === 'credit' && balance < 0) return Math.abs(balance);
    return 0;
  }
  function getCredit(balance: number, nature: string) {
    if (nature === 'credit' && balance > 0) return balance;
    if (nature === 'debit'  && balance < 0) return Math.abs(balance);
    return 0;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">ميزان المراجعة</h2>
          <p className="page-subtitle">
            {isBalanced
              ? <span style={{ color: 'var(--color-status-active)' }}>✓ الميزان متوازن</span>
              : <span style={{ color: '#dc2626' }}>✗ الميزان غير متوازن — الفرق: {fNum(Math.abs(totalDebit - totalCredit))}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        {[
          { label: 'إجمالي الأصول',       val: mockAccounts.find(a => a.code === '1')?.balance ?? 0, cls: 'account-type-asset' },
          { label: 'إجمالي الخصوم',       val: mockAccounts.find(a => a.code === '2')?.balance ?? 0, cls: 'account-type-liability' },
          { label: 'حقوق الملكية',        val: mockAccounts.find(a => a.code === '3')?.balance ?? 0, cls: 'account-type-equity' },
          { label: 'صافي الدخل',          val: (mockAccounts.find(a => a.code === '4')?.balance ?? 0) - (mockAccounts.find(a => a.code === '5')?.balance ?? 0), cls: '' },
        ].map(s => (
          <div key={s.label} className="acc-stat-cell">
            <span className={`status-badge ${s.cls}`} style={{ fontSize: 'var(--font-size-xs)', alignSelf: 'flex-start' }}>{s.label}</span>
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: s.val < 0 ? '#dc2626' : 'inherit' }}>
              {fNum(s.val, 0)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ر.س</span>
            </span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap', marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>بتاريخ</label>
          <OfsDatePicker value={asOf} onChange={setAsOf} aria-label="بتاريخ" />
        </div>
        <div style={{ flex: 1, minInlineSize: 200 }}>
          <input
            type="search"
            placeholder="بحث بالاسم أو الكود..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ofs-input"
            style={{ width: '100%' }}
          />
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={showHeaders} onChange={e => setShowHeaders(e.target.checked)} />
          إظهار الحسابات الرأسية
        </label>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 700 }}>
            <thead>
              <tr>
                <th style={{ minInlineSize: 100 }}>الكود</th>
                <th style={{ minInlineSize: 280 }}>اسم الحساب</th>
                <th>النوع</th>
                <th className="col-amount">مدين (ر.س)</th>
                <th className="col-amount">دائن (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(a => {
                const debit  = getDebit(a.balance, a.nature);
                const credit = getCredit(a.balance, a.nature);
                return (
                  <tr key={a.code} className={a.isHeader ? 'coa-header-row' : 'coa-detail-row'}>
                    <td>
                      <span className="coa-code-chip">{a.code}</span>
                    </td>
                    <td style={{ paddingInlineStart: `calc(var(--space-4) + ${(a.level - 1) * 16}px)`, fontWeight: a.isHeader ? 'var(--font-weight-semibold)' : undefined }}>
                      {a.nameAr}
                    </td>
                    <td>
                      {(a.level === 1 || a.level === 3 || a.level === 4) && (
                        <span className={`status-badge ${TYPE_CLASS[a.type]}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                          {ACCOUNT_TYPE_LABELS[a.type]}
                        </span>
                      )}
                    </td>
                    <td className="col-amount">
                      {debit > 0
                        ? <span className="amount-debit">{fNum(debit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      {credit > 0
                        ? <span className="amount-credit">{fNum(credit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="totals-label">الإجمالي</td>
                <td className="col-amount">
                  <span className={isBalanced ? 'amount-balanced' : 'amount-unbalanced'}>{fNum(totalDebit)}</span>
                </td>
                <td className="col-amount">
                  <span className={isBalanced ? 'amount-balanced' : 'amount-unbalanced'}>{fNum(totalCredit)}</span>
                </td>
              </tr>
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-2)', fontSize: 'var(--font-size-xs)' }}>
                  <span className={`je-balanced-chip ${isBalanced ? 'balanced' : 'unbalanced'}`} style={{ display: 'inline-flex' }}>
                    {isBalanced ? '✓ الميزان متوازن' : `✗ الفرق: ${fNum(Math.abs(totalDebit - totalCredit))}`}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
