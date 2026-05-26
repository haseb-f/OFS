'use client';

import { useMemo, useState } from 'react';
import {
  mockLedger,
  mockAccounts,
  type LedgerAccount,
} from '@/lib/mock-data';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtAmt(n: number) {
  if (n === 0) return '—';
  return fNum(Math.abs(n));
}

function fmtBalance(n: number) {
  return `${fNum(Math.abs(n))} ${n < 0 ? '(دائن)' : '(مدين)'}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GeneralLedgerPage() {
  const [selectedCode, setSelectedCode] = useState<string>(mockLedger[0]?.accountCode ?? '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const postingAccounts = mockAccounts.filter(a => !a.isHeader);

  const ledgerData: LedgerAccount | undefined = useMemo(
    () => mockLedger.find(l => l.accountCode === selectedCode),
    [selectedCode],
  );

  const filteredEntries = useMemo(() => {
    if (!ledgerData) return [];
    let entries = [...ledgerData.entries];
    if (dateFrom) entries = entries.filter(e => e.dateIso >= dateFrom);
    if (dateTo)   entries = entries.filter(e => e.dateIso <= dateTo);
    return entries.sort((a, b) => a.dateIso.localeCompare(b.dateIso));
  }, [ledgerData, dateFrom, dateTo]);

  const totalDebit  = filteredEntries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = filteredEntries.reduce((s, e) => s + e.credit, 0);

  const selectedAccount = mockAccounts.find(a => a.code === selectedCode);
  const openingBalance  = ledgerData?.openingBalance ?? 0;
  const closingBalance  = filteredEntries.length > 0
    ? (filteredEntries.at(-1)?.balance ?? openingBalance)
    : openingBalance;

  const hasLedger = !!ledgerData && filteredEntries.length > 0;

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">الأستاذ العام</h2>
          <p className="page-subtitle">حركات الحسابات التفصيلية مع الأرصدة الجارية</p>
        </div>
        <button type="button" className="btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          تصدير
        </button>
      </div>

      {/* Account selector + date range */}
      <div className="ofs-card ledger-account-selector" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', flex: 1, minInlineSize: 260 }}>
          <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
            الحساب
          </label>
          <OfsSelect
            options={[
              ...mockLedger.map(l => ({ value: l.accountCode, label: `${l.accountCode} — ${l.accountNameAr}` })),
              ...postingAccounts
                .filter(a => !mockLedger.some(l => l.accountCode === a.code))
                .map(a => ({ value: a.code, label: `${a.code} — ${a.nameAr}`, meta: 'لا توجد حركات', disabled: true })),
            ]}
            value={selectedCode}
            onChange={setSelectedCode}
            searchPlaceholder="بحث بكود أو اسم الحساب..."
            size="sm"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>من</label>
            <OfsDatePicker value={dateFrom} onChange={setDateFrom} size="sm" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>إلى</label>
            <OfsDatePicker value={dateTo} onChange={setDateTo} size="sm" />
          </div>
          {(dateFrom || dateTo) && (
            <button type="button" className="btn-ghost" onClick={() => { setDateFrom(''); setDateTo(''); }}>
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Account summary header */}
      {selectedAccount && (
        <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-4)' }}>
          <div className="acc-stat-cell">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الحساب</span>
            <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-base)' }}>
              {selectedAccount.nameAr}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{selectedAccount.code}</span>
          </div>
          <div className="acc-stat-cell">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>رصيد الافتتاح</span>
            <span style={{ fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-lg)', color: openingBalance >= 0 ? undefined : 'balance-negative' }}>
              {fmtBalance(openingBalance)}
            </span>
          </div>
          <div className="acc-stat-cell">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي المدين</span>
            <span style={{ fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-lg)' }}>
              {fNum(totalDebit)}
            </span>
          </div>
          <div className="acc-stat-cell">
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الرصيد الختامي</span>
            <span style={{ fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', fontSize: 'var(--font-size-lg)', color: closingBalance < 0 ? '#b91c1c' : 'var(--color-status-active)' }}>
              {fmtBalance(closingBalance)}
            </span>
          </div>
        </div>
      )}

      {/* Ledger table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 780 }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>التاريخ</th>
                <th>رقم القيد</th>
                <th style={{ minInlineSize: 220 }}>البيان</th>
                <th>المرجع</th>
                <th className="col-amount">مدين (ر.س)</th>
                <th className="col-amount">دائن (ر.س)</th>
                <th className="col-amount">الرصيد (ر.س)</th>
              </tr>
            </thead>
            <tbody>
              {/* Opening balance row */}
              {ledgerData && (
                <tr className="ledger-opening-row">
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>رصيد أول المدة</td>
                  <td colSpan={3}></td>
                  <td className="col-amount">—</td>
                  <td className="col-amount">—</td>
                  <td className="col-amount" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {fmtBalance(openingBalance)}
                  </td>
                </tr>
              )}

              {!ledgerData ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد حركات لهذا الحساب
                  </td>
                </tr>
              ) : !hasLedger ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد حركات في النطاق الزمني المحدد
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>{entry.date}</td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
                        {entry.entryNumber}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-sm)' }}>{entry.descriptionAr}</td>
                    <td>
                      {entry.reference && (
                        <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '1px 5px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                          {entry.reference}
                        </span>
                      )}
                    </td>
                    <td className="col-amount">
                      {entry.debit > 0
                        ? <span className="amount-debit">{fmtAmt(entry.debit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      {entry.credit > 0
                        ? <span className="amount-credit">{fmtAmt(entry.credit)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      <span className={entry.balance < 0 ? 'balance-negative' : ''} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {fmtBalance(entry.balance)}
                      </span>
                    </td>
                  </tr>
                ))
              )}

              {/* Closing balance row */}
              {hasLedger && (
                <tr className="ledger-closing-row">
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>رصيد آخر المدة</td>
                  <td colSpan={3}></td>
                  <td className="col-amount" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)' }}>
                    {fNum(totalDebit)}
                  </td>
                  <td className="col-amount" style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-primary)' }}>
                    {fNum(totalCredit)}
                  </td>
                  <td className="col-amount">
                    <span
                      className={closingBalance < 0 ? 'balance-negative' : 'balance-positive'}
                      style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)' }}
                    >
                      {fmtBalance(closingBalance)}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>

            {/* Grand totals */}
            {hasLedger && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="totals-label">مجموع الحركات ({filteredEntries.length})</td>
                  <td className="col-amount">
                    {fNum(totalDebit)}
                  </td>
                  <td className="col-amount">
                    {fNum(totalCredit)}
                  </td>
                  <td className="col-amount"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
