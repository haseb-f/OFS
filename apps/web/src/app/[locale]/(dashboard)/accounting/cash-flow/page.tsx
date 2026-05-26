'use client';

import { useState } from 'react';
import { fNum } from '@/lib/format';

// ── Mock data ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { value: 'q2-2026', label: 'الربع الثاني 2026' },
  { value: 'q1-2026', label: 'الربع الأول 2026' },
  { value: 'h1-2026', label: 'النصف الأول 2026' },
  { value: 'fy-2025', label: 'السنة المالية 2025' },
];

interface CFItem {
  nameAr: string;
  amount: number;
  isTotal?: boolean;
}

interface CFSection {
  titleAr: string;
  icon: string;
  accent: string;
  borderColor: string;
  items: CFItem[];
  total: number;
}

const SECTIONS: CFSection[] = [
  {
    titleAr:     'التدفقات من الأنشطة التشغيلية',
    icon:        '⚙',
    accent:      '#f0fdf4',
    borderColor: '#16a34a',
    total:       228300,
    items: [
      { nameAr: 'صافي الدخل',                          amount:  168300 },
      { nameAr: 'تعديلات لتسوية صافي الدخل:',          amount:       0, isTotal: true },
      { nameAr: 'استهلاك الأصول الثابتة',               amount:    8400 },
      { nameAr: 'الزيادة في الذمم المدينة',             amount:  -44000 },
      { nameAr: 'الانخفاض في المخزون',                  amount:   12000 },
      { nameAr: 'الزيادة في الذمم الدائنة',             amount:   87500 },
      { nameAr: 'الزيادة في المصروفات المستحقة',        amount:   58600 },
      { nameAr: 'الزيادة في ضريبة القيمة المضافة',      amount:  -62500 },
    ],
  },
  {
    titleAr:     'التدفقات من الأنشطة الاستثمارية',
    icon:        '📈',
    accent:      '#eff6ff',
    borderColor: '#3b82f6',
    total:       -154000,
    items: [
      { nameAr: 'شراء أثاث ومعدات مكتبية',              amount:  -54000 },
      { nameAr: 'شراء أجهزة حاسب آلي',                 amount: -100000 },
    ],
  },
  {
    titleAr:     'التدفقات من الأنشطة التمويلية',
    icon:        '💰',
    accent:      '#f5f3ff',
    borderColor: '#7c3aed',
    total:       150000,
    items: [
      { nameAr: 'حقن رأس مال من الشركاء',               amount:  150000 },
    ],
  },
];

const NET_CHANGE   = SECTIONS.reduce((s, sec) => s + sec.total, 0);
const OPENING_CASH = 35000;
const CLOSING_CASH = OPENING_CASH + NET_CHANGE;

export default function CashFlowPage() {
  const [period, setPeriod] = useState(PERIODS[0].value);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">قائمة التدفقات النقدية</h2>
          <p className="page-subtitle">الطريقة غير المباشرة — {PERIODS.find(p => p.value === period)?.label}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <select value={period} onChange={e => setPeriod(e.target.value)} className="ofs-input">
            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button type="button" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            تصدير
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        {[
          { label: 'النقدية الافتتاحية', value: OPENING_CASH, color: '#64748b' },
          { label: 'تشغيلي',             value: SECTIONS[0].total, color: '#16a34a' },
          { label: 'استثماري',           value: SECTIONS[1].total, color: '#dc2626' },
          { label: 'تمويلي',             value: SECTIONS[2].total, color: '#7c3aed' },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div className="kpi-card-value" style={{ color: kpi.color, fontSize: 'var(--font-size-lg)' }}>
              {kpi.value < 0 ? `(${fNum(Math.abs(kpi.value), 0)})` : fNum(kpi.value, 0)}
            </div>
            <div className="kpi-card-label">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>

        {/* Each section */}
        {SECTIONS.map((sec, si) => (
          <div key={si} className="ofs-card" style={{ overflow: 'hidden', borderInlineStart: `3px solid ${sec.borderColor}` }}>
            <div style={{ padding: 'var(--space-3) var(--space-5)', background: sec.accent, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBlockEnd: '1px solid var(--color-border)' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ marginInlineEnd: 'var(--space-2)' }}>{sec.icon}</span>
                {sec.titleAr}
              </span>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', fontFamily: 'monospace', color: sec.total >= 0 ? '#16a34a' : '#dc2626' }}>
                {sec.total < 0 ? `(${fNum(Math.abs(sec.total))})` : fNum(sec.total)}
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
              </span>
            </div>
            <div>
              {sec.items.filter(i => i.amount !== 0 || i.isTotal).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-5)', borderBlockEnd: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', background: item.isTotal ? 'var(--color-surface-raised)' : undefined }}>
                  <span style={{ fontWeight: item.isTotal ? 'var(--font-weight-semibold)' : undefined }}>
                    {item.nameAr}
                  </span>
                  {!item.isTotal && (
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', color: item.amount < 0 ? '#dc2626' : item.amount > 0 ? '#16a34a' : 'var(--color-text-muted)' }}>
                      {item.amount < 0 ? `(${fNum(Math.abs(item.amount))})` : item.amount > 0 ? `+ ${fNum(item.amount)}` : '—'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Net change + closing */}
        <div className="ofs-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-5)', borderBlockEnd: '1px solid var(--color-border)', background: 'var(--color-surface-raised)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
            <span>النقدية الافتتاحية</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>{fNum(OPENING_CASH)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-5)', borderBlockEnd: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}>
            <span>صافي التغير في النقدية</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontWeight: 'var(--font-weight-semibold)', color: NET_CHANGE >= 0 ? '#16a34a' : '#dc2626' }}>
              {NET_CHANGE < 0 ? `(${fNum(Math.abs(NET_CHANGE))})` : `+ ${fNum(NET_CHANGE)}`}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)', background: CLOSING_CASH >= 0 ? '#f0fdf4' : '#fef2f2', fontWeight: 'var(--font-weight-bold)' }}>
            <span style={{ fontSize: 'var(--font-size-base)' }}>النقدية الختامية</span>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace', fontSize: 'var(--font-size-lg)', color: CLOSING_CASH >= 0 ? '#16a34a' : '#dc2626' }}>
              {fNum(CLOSING_CASH)} <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>ر.س</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
