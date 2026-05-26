'use client';

import { useState } from 'react';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

// ── Mock data ─────────────────────────────────────────────────────────────────

interface BSItem {
  code: string;
  nameAr: string;
  value: number;
  indent?: number;
  bold?: boolean;
}

interface BSSection {
  titleAr: string;
  items: BSItem[];
  total: number;
  totalLabel: string;
  accent: string;
}

const ASSETS: BSSection[] = [
  {
    titleAr: 'الأصول المتداولة',
    totalLabel: 'إجمالي الأصول المتداولة',
    accent: '#eff6ff',
    items: [
      { code: '110101', nameAr: 'الصندوق',              value:  12400 },
      { code: '110102', nameAr: 'البنك الأهلي',         value:  98000 },
      { code: '110103', nameAr: 'بنك الراجحي',          value:  75000 },
      { code: '110201', nameAr: 'عملاء محليون',         value:  98300 },
      { code: '110202', nameAr: 'عملاء خليجيون',        value:  44000 },
      { code: '110301', nameAr: 'بضاعة للبيع',          value:  35000 },
    ],
    total: 362700,
  },
  {
    titleAr: 'الأصول الثابتة (صافي)',
    totalLabel: 'إجمالي الأصول الثابتة',
    accent: '#f0fdf4',
    items: [
      { code: '120101', nameAr: 'أثاث ومعدات',           value:  54000 },
      { code: '120102', nameAr: 'أجهزة حاسب آلي',        value: 100000 },
      { code: '120201', nameAr: '(−) استهلاك أثاث',      value: -12500 },
      { code: '120202', nameAr: '(−) استهلاك أجهزة',     value: -19000 },
    ],
    total: 122500,
  },
];

const LIABILITIES: BSSection[] = [
  {
    titleAr: 'الخصوم المتداولة',
    totalLabel: 'إجمالي الخصوم المتداولة',
    accent: '#fef2f2',
    items: [
      { code: '210101', nameAr: 'موردون محليون',         value:  87500 },
      { code: '210201', nameAr: 'رواتب مستحقة',         value:  58600 },
      { code: '210301', nameAr: 'ضريبة ق.م.م المستحقة', value:  52500 },
    ],
    total: 198600,
  },
];

const EQUITY: BSSection[] = [
  {
    titleAr: 'حقوق الملكية',
    totalLabel: 'إجمالي حقوق الملكية',
    accent: '#f5f3ff',
    items: [
      { code: '310101', nameAr: 'رأس مال الشركاء',  value: 150000 },
      { code: '320101', nameAr: 'أرباح محتجزة',     value:  18400 },
      { code: 'NET',    nameAr: 'صافي الدخل',       value: 168300 },
    ],
    total: 336700,
  },
];

const TOTAL_ASSETS = ASSETS.reduce((s, sec) => s + sec.total, 0);
const TOTAL_LIAB_EQ = LIABILITIES.reduce((s, sec) => s + sec.total, 0) + EQUITY.reduce((s, sec) => s + sec.total, 0);

function SectionBlock({ section }: { section: BSSection }) {
  return (
    <div style={{ marginBlockEnd: 'var(--space-4)' }}>
      <div style={{ padding: 'var(--space-2) var(--space-4)', background: section.accent, borderRadius: 'var(--radius-md)', marginBlockEnd: 'var(--space-1)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
        {section.titleAr}
      </div>
      {section.items.map(item => (
        <div key={item.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-4)', borderBlockEnd: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className="coa-code-chip" style={{ fontSize: 'var(--font-size-xs)' }}>{item.code}</span>
            <span style={{ color: item.value < 0 ? '#dc2626' : 'inherit' }}>{item.nameAr}</span>
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', color: item.value < 0 ? '#dc2626' : 'inherit' }}>
            {item.value < 0 ? `(${fNum(Math.abs(item.value))})` : fNum(item.value)}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-4)', background: section.accent, fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
        <span>{section.totalLabel}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', color: 'var(--color-primary)' }}>{fNum(section.total)}</span>
      </div>
    </div>
  );
}

export default function BalanceSheetPage() {
  const [asOf, setAsOf] = useState('2026-05-25');
  const isBalanced = Math.abs(TOTAL_ASSETS - TOTAL_LIAB_EQ) < 0.01;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">قائمة المركز المالي</h2>
          <p className="page-subtitle">
            الميزانية العمومية —&nbsp;
            {isBalanced
              ? <span style={{ color: '#16a34a' }}>✓ متوازنة</span>
              : <span style={{ color: '#dc2626' }}>✗ غير متوازنة — الفرق: {fNum(Math.abs(TOTAL_ASSETS - TOTAL_LIAB_EQ))}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <OfsDatePicker value={asOf} onChange={setAsOf} aria-label="بتاريخ" />
          <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="acc-stat-grid ofs-card" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي الأصول</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: '#1d4ed8' }}>{fNum(TOTAL_ASSETS, 0)}</span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>إجمالي الخصوم</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: '#dc2626' }}>{fNum(LIABILITIES.reduce((s, sec) => s + sec.total, 0), 0)}</span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>حقوق الملكية</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums', color: '#7c3aed' }}>{fNum(EQUITY.reduce((s, sec) => s + sec.total, 0), 0)}</span>
        </div>
        <div className="acc-stat-cell">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>نسبة الدين</span>
          <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
            {((LIABILITIES.reduce((s, sec) => s + sec.total, 0) / TOTAL_ASSETS) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>

        {/* Assets column */}
        <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-2)', borderBlockEnd: '2px solid var(--color-primary)', color: '#1d4ed8' }}>
            الأصول
          </h3>
          {ASSETS.map((sec, i) => <SectionBlock key={i} section={sec} />)}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: '#eff6ff', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-bold)' }}>
            <span>إجمالي الأصول</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 'var(--font-size-base)', color: '#1d4ed8' }}>{fNum(TOTAL_ASSETS)}</span>
          </div>
        </div>

        {/* Liabilities + Equity column */}
        <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-bold)', marginBlockEnd: 'var(--space-4)', paddingBlockEnd: 'var(--space-2)', borderBlockEnd: '2px solid #dc2626', color: '#dc2626' }}>
            الخصوم وحقوق الملكية
          </h3>
          {LIABILITIES.map((sec, i) => <SectionBlock key={i} section={sec} />)}
          {EQUITY.map((sec, i)      => <SectionBlock key={i} section={sec} />)}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: '#fef2f2', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-bold)' }}>
            <span>إجمالي الخصوم وحقوق الملكية</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 'var(--font-size-base)', color: '#dc2626' }}>{fNum(TOTAL_LIAB_EQ)}</span>
          </div>
          <div style={{ marginBlockStart: 'var(--space-3)', textAlign: 'center' }}>
            <span className={`je-balanced-chip ${isBalanced ? 'balanced' : 'unbalanced'}`}>
              {isBalanced ? '✓ القائمة متوازنة' : `✗ الفرق: ${fNum(Math.abs(TOTAL_ASSETS - TOTAL_LIAB_EQ))}`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
