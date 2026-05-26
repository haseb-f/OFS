'use client';

import { useMemo, useState } from 'react';
import { mockLedger, mockAccounts, type LedgerAccount } from '@/lib/mock-data';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const ACCOUNT_OPTIONS = mockAccounts.filter(a => !a.isHeader);

function StatCell({ label, value, accent }: { label: string; value: string; accent?: 'debit' | 'credit' | 'neutral' }) {
  const color = accent === 'debit' ? '#1d4ed8' : accent === 'credit' ? '#16a34a' : 'var(--color-text-primary)';
  return (
    <div className="acc-stat-cell">
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>{label}</span>
      <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color }}>
        {value} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-regular)' }}>ر.س</span>
      </span>
    </div>
  );
}

export default function AccountStatementPage() {
  const [accountCode, setAccountCode] = useState(mockLedger[0]?.accountCode ?? '');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');

  const ledgerAccount: LedgerAccount | undefined = useMemo(
    () => mockLedger.find(l => l.accountCode === accountCode),
    [accountCode],
  );

  const entries = useMemo(() => {
    if (!ledgerAccount) return [];
    let rows = [...ledgerAccount.entries];
    if (dateFrom) rows = rows.filter(e => e.dateIso >= dateFrom);
    if (dateTo)   rows = rows.filter(e => e.dateIso <= dateTo);
    return rows.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [ledgerAccount, dateFrom, dateTo]);

  const totalDebit  = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);
  const opening     = ledgerAccount?.openingBalance ?? 0;
  const closing     = opening + totalDebit - totalCredit;

  const selectedAccount = ACCOUNT_OPTIONS.find(a => a.code === accountCode);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">كشف الحساب</h2>
          <p className="page-subtitle">
            {selectedAccount ? `${selectedAccount.code} — ${selectedAccount.nameAr}` : 'حدد حساباً لعرض الكشف'}
          </p>
        </div>
        <button type="button" className="btn-outline" style={{ gap: 'var(--space-2)', display: 'inline-flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          تصدير PDF
        </button>
      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div style={{ flex: 2, minInlineSize: 220 }}>
          <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>الحساب</label>
          <select
            value={accountCode}
            onChange={e => setAccountCode(e.target.value)}
            className="ofs-input"
            style={{ width: '100%' }}
          >
            {ACCOUNT_OPTIONS.map(a => (
              <option key={a.code} value={a.code}>{a.code} — {a.nameAr}</option>
            ))}
          </select>
        </div>
        <div className="je-date-range" style={{ alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>من تاريخ</label>
            <OfsDatePicker value={dateFrom} onChange={setDateFrom} aria-label="من تاريخ" />
          </div>
          <span className="je-date-range-sep" style={{ paddingBlockEnd: 8 }}>—</span>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-1)' }}>إلى تاريخ</label>
            <OfsDatePicker value={dateTo} onChange={setDateTo} aria-label="إلى تاريخ" />
          </div>
        </div>
        {(dateFrom || dateTo) && (
          <button type="button" className="btn-ghost" style={{ alignSelf: 'flex-end' }} onClick={() => { setDateFrom(''); setDateTo(''); }}>
            مسح
          </button>
        )}
      </div>

      {/* Summary stats */}
      <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <StatCell label="الرصيد الافتتاحي"  value={fNum(opening)}  accent="neutral" />
        <StatCell label="إجمالي المدين"      value={fNum(totalDebit)}  accent="debit"   />
        <StatCell label="إجمالي الدائن"      value={fNum(totalCredit)} accent="credit"  />
        <StatCell label="الرصيد الختامي"     value={fNum(closing)}  accent={closing >= 0 ? 'neutral' : 'debit'} />
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 800 }}>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>رقم القيد</th>
                <th>البيان</th>
                <th>المرجع</th>
                <th className="col-amount">مدين (ر.س)</th>
                <th className="col-amount">دائن (ر.س)</th>
                <th className="col-amount">الرصيد (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance row */}
              <tr style={{ background: 'color-mix(in srgb, var(--color-primary) 4%, var(--color-surface))' }}>
                <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>—</td>
                <td />
                <td style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>رصيد أول المدة</td>
                <td />
                <td />
                <td />
                <td className="col-amount">
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-semibold)' }}>
                    {fNum(opening)}
                  </span>
                </td>
              </tr>

              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد حركات في الفترة المحددة
                  </td>
                </tr>
              ) : (
                entries.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                        {e.entryNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.descriptionAr}
                    </td>
                    <td>
                      {e.reference && (
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '1px 5px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                          {e.reference}
                        </span>
                      )}
                    </td>
                    <td className="col-amount">
                      {e.debit > 0
                        ? <span className="amount-debit">{fNum(e.debit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      {e.credit > 0
                        ? <span className="amount-credit">{fNum(e.credit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-medium)', color: e.balance < 0 ? '#dc2626' : 'inherit' }}>
                        {fNum(Math.abs(e.balance))}{e.balance < 0 ? ' د' : ' د'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="totals-label">الإجمالي</td>
                  <td className="col-amount"><span className="amount-debit">{fNum(totalDebit)}</span></td>
                  <td className="col-amount"><span className="amount-credit">{fNum(totalCredit)}</span></td>
                  <td className="col-amount">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: closing < 0 ? '#dc2626' : 'var(--color-primary)' }}>
                      {fNum(Math.abs(closing))}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
