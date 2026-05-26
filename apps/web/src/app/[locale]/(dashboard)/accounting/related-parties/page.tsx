'use client';

import { useMemo, useState } from 'react';
import { fNum } from '@/lib/format';

// ── Mock data ─────────────────────────────────────────────────────────────────

type PartyType = 'customer' | 'vendor' | 'shareholder' | 'employee' | 'bank' | 'government';

const TYPE_LABELS: Record<PartyType, string> = {
  customer:    'عميل',
  vendor:      'مورد',
  shareholder: 'شريك / مساهم',
  employee:    'موظف',
  bank:        'بنك / مؤسسة مالية',
  government:  'جهة حكومية',
};

const TYPE_COLORS: Record<PartyType, { bg: string; color: string }> = {
  customer:    { bg: '#f0fdf4', color: '#166534' },
  vendor:      { bg: '#fef2f2', color: '#b91c1c' },
  shareholder: { bg: '#f5f3ff', color: '#6d28d9' },
  employee:    { bg: '#eff6ff', color: '#1d4ed8' },
  bank:        { bg: '#fffbeb', color: '#b45309' },
  government:  { bg: '#f0f9ff', color: '#0369a1' },
};

interface RelatedParty {
  id: string;
  code: string;
  nameAr: string;
  type: PartyType;
  relationship: string;
  taxNumber?: string;
  phone?: string;
  balanceDue: number;
  balanceOwed: number;
  creditLimit?: number;
  lastTransaction: string;
  isActive: boolean;
}

const MOCK_PARTIES: RelatedParty[] = [
  { id: 'rp-001', code: 'CUS-0001', nameAr: 'شركة النخبة للتجارة',           type: 'customer',    relationship: 'عميل تجاري رئيسي',              taxNumber: '300123456700003', phone: '+966 11 234 5678', balanceDue:  35500, balanceOwed:      0, creditLimit: 200000, lastTransaction: '20 May 2026', isActive: true },
  { id: 'rp-002', code: 'CUS-0003', nameAr: 'مستشفى الحياة التخصصي',        type: 'customer',    relationship: 'عميل مؤسسي طبي',                taxNumber: '300987654300003', phone: '+966 11 456 7890', balanceDue:  70000, balanceOwed:      0, creditLimit: 500000, lastTransaction: '22 May 2026', isActive: true },
  { id: 'rp-003', code: 'CUS-0007', nameAr: 'وزارة الشؤون البلدية والقروية',  type: 'government',  relationship: 'عميل حكومي — عقود توريد',        taxNumber: '300111222300003', phone: '+966 11 555 6677', balanceDue: 200000, balanceOwed:      0, creditLimit: 1000000, lastTransaction: '15 May 2026', isActive: true },
  { id: 'rp-004', code: 'VND-0001', nameAr: 'مؤسسة الأمل للتجارة',           type: 'vendor',      relationship: 'مورد بضاعة رئيسي',                                           phone: '+966 11 777 8899', balanceDue:      0, balanceOwed:  87500,               lastTransaction: '05 Mar 2026', isActive: true },
  { id: 'rp-005', code: 'VND-0002', nameAr: 'شركة التوريدات الصناعية',        type: 'vendor',      relationship: 'مورد معدات ومواد',                                            phone: '+966 12 333 4455', balanceDue:      0, balanceOwed:  22000,               lastTransaction: '18 Apr 2026', isActive: true },
  { id: 'rp-006', code: 'SHR-0001', nameAr: 'خالد عبدالعزيز الشمري',          type: 'shareholder', relationship: 'شريك مؤسس — حصة 60%',                                         phone: '+966 50 100 2233', balanceDue:      0, balanceOwed:      0, creditLimit: 0, lastTransaction: '01 Jan 2026', isActive: true },
  { id: 'rp-007', code: 'SHR-0002', nameAr: 'سعد محمد الغامدي',               type: 'shareholder', relationship: 'شريك — حصة 40%',                                              phone: '+966 55 300 4455', balanceDue:      0, balanceOwed:      0, creditLimit: 0, lastTransaction: '01 Jan 2026', isActive: true },
  { id: 'rp-008', code: 'EMP-0001', nameAr: 'فيصل الدوسري',                   type: 'employee',    relationship: 'مدير مالي — مسحوب على الحساب',                                phone: '+966 53 500 6677', balanceDue:      0, balanceOwed:   5000,               lastTransaction: '22 May 2026', isActive: true },
  { id: 'rp-009', code: 'BNK-0001', nameAr: 'البنك الأهلي التجاري',           type: 'bank',        relationship: 'حساب جاري رئيسي + تسهيلات',      taxNumber: '300000000100001', phone: '+966 11 800 0000', balanceDue:      0, balanceOwed:      0,               lastTransaction: '18 May 2026', isActive: true },
  { id: 'rp-010', code: 'BNK-0002', nameAr: 'مصرف الراجحي',                  type: 'bank',        relationship: 'حساب ادخاري',                     taxNumber: '300000000200001', phone: '+966 11 211 7777', balanceDue:      0, balanceOwed:      0,               lastTransaction: '01 May 2026', isActive: true },
  { id: 'rp-011', code: 'CUS-0011', nameAr: 'شركة الفجر للمقاولات',           type: 'customer',    relationship: 'عميل مُحال — مشاريع إنشائية',     taxNumber: '300222333400003', phone: '+966 12 345 6789', balanceDue: 120000, balanceOwed:      0, creditLimit: 400000, lastTransaction: '23 May 2026', isActive: true },
  { id: 'rp-012', code: 'VND-0003', nameAr: 'شركة اللوجستيات السريعة',        type: 'vendor',      relationship: 'مزود خدمات شحن',                                             phone: '+966 13 900 1122', balanceDue:      0, balanceOwed:   8400,               lastTransaction: '10 May 2026', isActive: false },
];

const TYPE_FILTER_OPTIONS: Array<{ val: PartyType | 'all'; label: string }> = [
  { val: 'all',         label: 'الكل' },
  { val: 'customer',    label: 'عملاء' },
  { val: 'vendor',      label: 'موردون' },
  { val: 'shareholder', label: 'شركاء / مساهمون' },
  { val: 'employee',    label: 'موظفون' },
  { val: 'bank',        label: 'بنوك' },
  { val: 'government',  label: 'جهات حكومية' },
];

export default function RelatedPartiesPage() {
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState<PartyType | 'all'>('all');
  const [showInactive, setShowInactive] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_PARTIES.filter(p => {
      if (!showInactive && !p.isActive) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!p.nameAr.includes(q) && !p.code.toLowerCase().includes(q) && !p.relationship.includes(q)) return false;
      }
      return true;
    });
  }, [search, typeFilter, showInactive]);

  const totalDue   = filtered.reduce((s, p) => s + p.balanceDue,  0);
  const totalOwed  = filtered.reduce((s, p) => s + p.balanceOwed, 0);
  const netBalance = totalDue - totalOwed;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">الأطراف ذات الصلة</h2>
          <p className="page-subtitle">{MOCK_PARTIES.filter(p => p.isActive).length} طرف نشط من أصل {MOCK_PARTIES.length}</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          طرف جديد
        </button>
      </div>

      {/* Summary */}
      <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي المستحق لنا</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: '#1d4ed8' }}>
            {fNum(MOCK_PARTIES.reduce((s, p) => s + p.balanceDue, 0), 0)}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي المستحق علينا</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: '#dc2626' }}>
            {fNum(MOCK_PARTIES.reduce((s, p) => s + p.balanceOwed, 0), 0)}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>الصافي</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
            {netBalance < 0 ? `(${fNum(Math.abs(MOCK_PARTIES.reduce((s, p) => s + p.balanceDue, 0) - MOCK_PARTIES.reduce((s, p) => s + p.balanceOwed, 0)), 0)})` : fNum(MOCK_PARTIES.reduce((s, p) => s + p.balanceDue, 0) - MOCK_PARTIES.reduce((s, p) => s + p.balanceOwed, 0), 0)}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
          </span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>حجم الائتمان الممنوح</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
            {fNum(MOCK_PARTIES.filter(p => p.creditLimit).reduce((s, p) => s + (p.creditLimit ?? 0), 0), 0)}
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap', marginBlockEnd: 'var(--space-4)' }}>
        {TYPE_FILTER_OPTIONS.map(t => (
          <button
            key={t.val}
            type="button"
            className={typeFilter === t.val ? 'btn-cta' : 'btn-outline'}
            style={{ fontSize: 'var(--font-size-sm)', padding: '6px 14px' }}
            onClick={() => setTypeFilter(t.val)}
          >
            {t.label}
          </button>
        ))}
        <div style={{ flex: 1, minInlineSize: 200 }}>
          <input
            type="search"
            placeholder="بحث بالاسم أو الكود أو طبيعة العلاقة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ofs-input"
            style={{ width: '100%' }}
          />
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
          <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} />
          إظهار غير النشطين
        </label>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 1000 }}>
            <thead>
              <tr>
                <th>الكود</th>
                <th style={{ minInlineSize: 220 }}>اسم الطرف</th>
                <th>النوع</th>
                <th style={{ minInlineSize: 200 }}>طبيعة العلاقة</th>
                <th>رقم ضريبي</th>
                <th className="col-amount">مستحق لنا (ر.س)</th>
                <th className="col-amount">مستحق علينا (ر.س)</th>
                <th className="col-amount">الصافي (ر.س)</th>
                <th>آخر معاملة</th>
                <th style={{ textAlign: 'center' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>لا توجد أطراف مطابقة</td></tr>
              ) : filtered.map(p => {
                const net = p.balanceDue - p.balanceOwed;
                const colors = TYPE_COLORS[p.type];
                return (
                  <tr key={p.id}>
                    <td><span className="coa-code-chip">{p.code}</span></td>
                    <td style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{p.nameAr}</td>
                    <td>
                      <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 99, background: colors.bg, color: colors.color, fontWeight: 'var(--font-weight-medium)' }}>
                        {TYPE_LABELS[p.type]}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', maxInlineSize: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.relationship}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{p.taxNumber ?? '—'}</td>
                    <td className="col-amount">
                      {p.balanceDue > 0
                        ? <span className="amount-debit">{fNum(p.balanceDue)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      {p.balanceOwed > 0
                        ? <span className="amount-credit">{fNum(p.balanceOwed)}</span>
                        : <span className="amount-zero">—</span>}
                    </td>
                    <td className="col-amount">
                      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-semibold)', color: net > 0 ? '#1d4ed8' : net < 0 ? '#dc2626' : 'var(--color-text-muted)' }}>
                        {net === 0 ? '—' : net > 0 ? `+ ${fNum(net)}` : `(${fNum(Math.abs(net))})`}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>{p.lastTransaction}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: p.isActive ? 'var(--color-status-active)' : 'var(--color-text-muted)' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} className="totals-label">الإجمالي ({filtered.length})</td>
                  <td className="col-amount"><span className="amount-debit">{fNum(totalDue)}</span></td>
                  <td className="col-amount"><span className="amount-credit">{fNum(totalOwed)}</span></td>
                  <td className="col-amount">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: netBalance >= 0 ? '#16a34a' : '#dc2626' }}>
                      {netBalance >= 0 ? fNum(netBalance) : `(${fNum(Math.abs(netBalance))})`}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
