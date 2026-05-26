'use client';

import { useMemo, useState } from 'react';
import {
  mockAccounts,
  ACCOUNT_TYPE_LABELS,
  type AccountType,
  type Account,
} from '@/lib/mock-data';
import { fNum } from '@/lib/format';

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_CLASS: Record<AccountType, string> = {
  asset:     'account-type-asset',
  liability: 'account-type-liability',
  equity:    'account-type-equity',
  revenue:   'account-type-revenue',
  expense:   'account-type-expense',
};

function AccountTypeBadge({ type }: { type: AccountType }) {
  return (
    <span className={`status-badge ${TYPE_CLASS[type]}`} style={{ fontSize: 'var(--font-size-xs)' }}>
      {ACCOUNT_TYPE_LABELS[type]}
    </span>
  );
}

function fmtBalance(n: number): string {
  return fNum(Math.abs(n));
}

// ── Row component ─────────────────────────────────────────────────────────────

function AccountRow({
  account,
  children,
  expanded,
  onToggle,
  hasChildren,
}: {
  account: Account;
  children?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
}) {
  const isHeader = account.isHeader;
  const balance  = account.balance;

  return (
    <>
      <tr
        className={isHeader ? 'coa-header-row' : 'coa-detail-row'}
        style={{ cursor: hasChildren ? 'pointer' : undefined }}
        onClick={hasChildren ? onToggle : undefined}
      >
        <td className={`coa-row-level-${account.level}`} style={{ paddingInlineStart: `calc(var(--space-4) + ${(account.level - 1) * 20}px)` }}>
          <span className="coa-expand-btn">
            {hasChildren && (
              <span className={`coa-expand-icon${expanded ? ' open' : ''}`}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </span>
            )}
            {!hasChildren && <span style={{ width: 12, display: 'inline-block' }} />}
            <span className="coa-code-chip">{account.code}</span>
            <span style={{ fontWeight: isHeader ? 'var(--font-weight-semibold)' : undefined }}>
              {account.nameAr}
            </span>
            {isHeader && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 'var(--space-1)', background: 'var(--color-border)', borderRadius: 99, padding: '1px 6px' }}>
                رأسي
              </span>
            )}
          </span>
        </td>
        <td>
          {account.level === 1 || account.level === 4 ? (
            <AccountTypeBadge type={account.type} />
          ) : null}
        </td>
        <td style={{ fontSize: 'var(--font-size-xs)', textAlign: 'center' }}>
          <span style={{
            padding: '1px 8px',
            borderRadius: 99,
            fontSize: 'var(--font-size-xs)',
            background: account.nature === 'debit' ? '#eff6ff' : '#f0fdf4',
            color: account.nature === 'debit' ? '#1d4ed8' : '#166534',
          }}>
            {account.nature === 'debit' ? 'مدين' : 'دائن'}
          </span>
        </td>
        <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
          {account.isHeader ? (
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: Math.abs(balance) > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
              {fmtBalance(balance)}
            </span>
          ) : (
            <span className={balance >= 0 ? '' : 'balance-negative'}>
              {fmtBalance(balance)}
            </span>
          )}
        </td>
        <td style={{ textAlign: 'end', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {account.currency}
        </td>
        <td style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            width: 8, height: 8,
            borderRadius: '50%',
            background: account.isActive ? 'var(--color-status-active)' : 'var(--color-text-muted)',
          }} />
        </td>
      </tr>
      {expanded && children}
    </>
  );
}

// ── Recursive tree renderer ───────────────────────────────────────────────────

function AccountTree({
  accounts,
  parentCode,
  expanded,
  onToggle,
}: {
  accounts: Account[];
  parentCode: string | undefined;
  expanded: Set<string>;
  onToggle: (code: string) => void;
}) {
  const children = accounts.filter(a => a.parentCode === parentCode);
  return (
    <>
      {children.map(account => {
        const hasChildren = accounts.some(a => a.parentCode === account.code);
        const isExpanded  = expanded.has(account.code);
        return (
          <AccountRow
            key={account.code}
            account={account}
            hasChildren={hasChildren}
            expanded={isExpanded}
            onToggle={() => onToggle(account.code)}
          >
            {isExpanded && (
              <AccountTree
                accounts={accounts}
                parentCode={account.code}
                expanded={expanded}
                onToggle={onToggle}
              />
            )}
          </AccountRow>
        );
      })}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChartOfAccountsPage() {
  const [typeFilter, setTypeFilter] = useState<AccountType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(['1', '2', '3', '4', '5'])
  );

  const filteredAccounts = useMemo(() => {
    let data = mockAccounts;
    if (typeFilter !== 'all') data = data.filter(a => a.type === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(a => a.nameAr.includes(q) || a.code.includes(q));
    }
    return data;
  }, [typeFilter, search]);

  function toggleExpanded(code: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(mockAccounts.filter(a => a.isHeader).map(a => a.code)));
  }

  function collapseAll() {
    setExpanded(new Set(['1', '2', '3', '4', '5']));
  }

  const totalAccounts   = mockAccounts.filter(a => !a.isHeader).length;
  const totalAssets     = mockAccounts.find(a => a.code === '1')?.balance ?? 0;
  const totalLiabilities= mockAccounts.find(a => a.code === '2')?.balance ?? 0;
  const totalEquity     = mockAccounts.find(a => a.code === '3')?.balance ?? 0;
  const totalRevenue    = mockAccounts.find(a => a.code === '4')?.balance ?? 0;
  const totalExpenses   = mockAccounts.find(a => a.code === '5')?.balance ?? 0;

  const TYPES: { key: AccountType | 'all'; labelAr: string }[] = [
    { key: 'all', labelAr: 'الكل' },
    { key: 'asset', labelAr: 'أصول' },
    { key: 'liability', labelAr: 'خصوم' },
    { key: 'equity', labelAr: 'حقوق ملكية' },
    { key: 'revenue', labelAr: 'إيرادات' },
    { key: 'expense', labelAr: 'مصروفات' },
  ];

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">شجرة الحسابات</h2>
          <p className="page-subtitle">{totalAccounts} حساب تفصيلي — {mockAccounts.filter(a => a.isHeader).length} حساب رأسي</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          حساب جديد
        </button>
      </div>

      {/* Summary stats */}
      <div className="ofs-card" style={{ marginBlockEnd: 'var(--space-5)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1px', background: 'var(--color-border)' }}>
          {[
            { label: 'الأصول',        val: totalAssets,      cls: 'account-type-asset' },
            { label: 'الخصوم',        val: totalLiabilities, cls: 'account-type-liability' },
            { label: 'حقوق الملكية',  val: totalEquity,      cls: 'account-type-equity' },
            { label: 'الإيرادات',     val: totalRevenue,     cls: 'account-type-revenue' },
            { label: 'المصروفات',     val: totalExpenses,    cls: 'account-type-expense' },
          ].map(s => (
            <div key={s.label} style={{ padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span className={`status-badge ${s.cls}`} style={{ alignSelf: 'flex-start', fontSize: 'var(--font-size-xs)' }}>{s.label}</span>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
                {fNum(s.val, 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap', marginBlockEnd: 'var(--space-4)' }}>
        {TYPES.map(t => (
          <button
            key={t.key}
            type="button"
            className={typeFilter === t.key ? 'btn-cta' : 'btn-outline'}
            style={{ fontSize: 'var(--font-size-sm)', padding: '6px 14px' }}
            onClick={() => setTypeFilter(t.key)}
          >
            {t.labelAr}
          </button>
        ))}
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
        <button type="button" className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }} onClick={expandAll}>توسيع الكل</button>
        <button type="button" className="btn-ghost" style={{ fontSize: 'var(--font-size-xs)' }} onClick={collapseAll}>طي الكل</button>
      </div>

      {/* Tree table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 700 }}>
            <thead>
              <tr>
                <th style={{ minInlineSize: 300 }}>اسم الحساب</th>
                <th>النوع</th>
                <th style={{ textAlign: 'center' }}>الطبيعة</th>
                <th className="col-amount">الرصيد (ر.س)</th>
                <th className="col-amount">العملة</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {search || typeFilter !== 'all' ? (
                filteredAccounts.map(account => (
                  <tr key={account.code} className={account.isHeader ? 'coa-header-row' : 'coa-detail-row'}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span className="coa-code-chip">{account.code}</span>
                        <span style={{ fontWeight: account.isHeader ? 'var(--font-weight-semibold)' : undefined }}>{account.nameAr}</span>
                      </span>
                    </td>
                    <td><AccountTypeBadge type={account.type} /></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 'var(--font-size-xs)', background: account.nature === 'debit' ? '#eff6ff' : '#f0fdf4', color: account.nature === 'debit' ? '#1d4ed8' : '#166534' }}>
                        {account.nature === 'debit' ? 'مدين' : 'دائن'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'end', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                      {fmtBalance(account.balance)}
                    </td>
                    <td style={{ textAlign: 'end', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{account.currency}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: account.isActive ? 'var(--color-status-active)' : 'var(--color-text-muted)' }} />
                    </td>
                  </tr>
                ))
              ) : (
                <AccountTree
                  accounts={filteredAccounts}
                  parentCode={undefined}
                  expanded={expanded}
                  onToggle={toggleExpanded}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
