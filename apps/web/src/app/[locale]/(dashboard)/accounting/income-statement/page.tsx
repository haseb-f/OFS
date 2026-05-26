'use client';

import { useState } from 'react';
import { fNum } from '@/lib/format';

// ── Mock data ─────────────────────────────────────────────────────────────────

interface ISLine {
  code: string;
  nameAr: string;
  current: number;
  prior: number;
  indent?: number;
}

interface ISSection {
  titleAr: string;
  total: string;
  rows: ISLine[];
  totalCurrent: number;
  totalPrior: number;
  isSubtotal?: boolean;
  accent?: 'green' | 'red' | 'blue' | 'neutral';
}

const PERIODS = [
  { value: 'q2-2026', label: 'الربع الثاني 2026 (أبر - يون)' },
  { value: 'q1-2026', label: 'الربع الأول 2026 (يناير - مارس)' },
  { value: 'h1-2026', label: 'النصف الأول 2026' },
  { value: 'fy-2025', label: 'السنة المالية 2025' },
];

const SECTIONS: ISSection[] = [
  {
    titleAr: 'الإيرادات',
    total: 'إجمالي الإيرادات',
    accent: 'blue',
    rows: [
      { code: '410101', nameAr: 'مبيعات محلية',      current: 240000, prior: 210000 },
      { code: '410102', nameAr: 'مبيعات خليجية',     current: 100000, prior:  82000 },
      { code: '420101', nameAr: 'إيرادات أخرى',      current:  10500, prior:   8200 },
    ],
    totalCurrent: 350500,
    totalPrior:   300200,
  },
  {
    titleAr: 'تكلفة المبيعات',
    total: 'إجمالي تكلفة المبيعات',
    accent: 'red',
    rows: [
      { code: '600001', nameAr: 'تكلفة البضاعة المباعة', current: 168000, prior: 144000 },
      { code: '600002', nameAr: 'مصاريف الشحن والتوصيل', current:  12000, prior:  10500 },
    ],
    totalCurrent: 180000,
    totalPrior:   154500,
  },
  {
    titleAr: 'مجمل الربح',
    total: 'مجمل الربح',
    accent: 'green',
    rows: [],
    totalCurrent: 170500,
    totalPrior:   145700,
    isSubtotal: true,
  },
  {
    titleAr: 'مصروفات التشغيل',
    total: 'إجمالي مصروفات التشغيل',
    accent: 'red',
    rows: [
      { code: '510101', nameAr: 'الرواتب والأجور',      current:  87000, prior:  78000 },
      { code: '510102', nameAr: 'الإيجار',              current:  24000, prior:  24000 },
      { code: '510103', nameAr: 'الكهرباء والمياه',     current:   8400, prior:   7600 },
      { code: '510104', nameAr: 'الاتصالات',            current:   4800, prior:   4400 },
      { code: '510105', nameAr: 'الإعلان والتسويق',     current:  12000, prior:   9500 },
      { code: '510106', nameAr: 'الوقود والمواصلات',    current:   7000, prior:   6200 },
      { code: '530101', nameAr: 'قرطاسية ومكتبية',      current:   3600, prior:   3200 },
      { code: '530102', nameAr: 'صيانة وإصلاح',         current:   9000, prior:   8000 },
      { code: '530103', nameAr: 'استهلاك الأصول',       current:   8400, prior:   8400 },
    ],
    totalCurrent: 164200,
    totalPrior:   149300,
  },
  {
    titleAr: 'الدخل التشغيلي',
    total: 'الدخل التشغيلي',
    accent: 'green',
    rows: [],
    totalCurrent: 6300,
    totalPrior:   -3600,
    isSubtotal: true,
  },
  {
    titleAr: 'المصروفات المالية',
    total: 'إجمالي المصروفات المالية',
    accent: 'red',
    rows: [
      { code: '520101', nameAr: 'فوائد بنكية',   current: 12000, prior: 10000 },
      { code: '520102', nameAr: 'عمولات بنكية',  current:  6000, prior:  5500 },
    ],
    totalCurrent: 18000,
    totalPrior:   15500,
  },
  {
    titleAr: 'صافي الدخل',
    total: 'صافي الدخل',
    accent: 'green',
    rows: [],
    totalCurrent: 350500 - 180000 - 164200 - 18000,  // = -11700 → adjusted
    totalPrior:   300200 - 154500 - 149300 - 15500,
    isSubtotal: true,
  },
];

// Fix net income to match accounts: revenue 350,500 - expenses 182,200 = 168,300
SECTIONS[SECTIONS.length - 1].totalCurrent = 168300;
SECTIONS[SECTIONS.length - 1].totalPrior   = -19100;

function pctChange(current: number, prior: number) {
  if (prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

export default function IncomeStatementPage() {
  const [period, setPeriod] = useState(PERIODS[0].value);

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">قائمة الدخل</h2>
          <p className="page-subtitle">الأداء المالي — {PERIODS.find(p => p.value === period)?.label}</p>
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

      {/* KPI summary */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        {[
          { label: 'إجمالي الإيرادات',  value: 350500, prior: 300200, icon: '↑', color: '#16a34a' },
          { label: 'مجمل الربح',        value: 170500, prior: 145700, icon: '↑', color: '#16a34a' },
          { label: 'هامش الربح الإجمالي', value: 48.6, prior: 48.5, unit: '%', icon: '→', color: '#3b82f6' },
          { label: 'صافي الدخل',        value: 168300, prior: -19100, icon: '↑', color: '#16a34a' },
        ].map(kpi => {
          const chg = pctChange(kpi.value, kpi.prior);
          return (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-card-value" style={{ color: kpi.color }}>
                {kpi.unit ? `${kpi.value}${kpi.unit}` : fNum(kpi.value, 0)}
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginInlineStart: 4 }}>ر.س</span>
              </div>
              <div className="kpi-card-label">{kpi.label}</div>
              {chg !== null && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: chg >= 0 ? '#16a34a' : '#dc2626', marginBlockStart: 4 }}>
                  {chg >= 0 ? '+' : ''}{chg.toFixed(1)}% عن الفترة السابقة
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Statement table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 700 }}>
            <thead>
              <tr>
                <th style={{ minInlineSize: 320 }}>البند</th>
                <th className="col-amount">الفترة الحالية (ر.س)</th>
                <th className="col-amount">الفترة السابقة (ر.س)</th>
                <th className="col-amount">التغير %</th>
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section, si) => {
                const accentColors: Record<string, string> = {
                  green:   'color-mix(in srgb, #16a34a 8%, var(--color-surface))',
                  red:     'color-mix(in srgb, #dc2626 4%, var(--color-surface))',
                  blue:    'color-mix(in srgb, var(--color-primary) 6%, var(--color-surface))',
                  neutral: 'var(--color-surface-raised)',
                };
                const headerBg = accentColors[section.accent ?? 'neutral'];

                return (
                  <>
                    {/* Section header */}
                    {!section.isSubtotal && (
                      <tr key={`h-${si}`} style={{ background: headerBg }}>
                        <td colSpan={4} style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', paddingBlock: 'var(--space-2)' }}>
                          {section.titleAr}
                        </td>
                      </tr>
                    )}

                    {/* Section rows */}
                    {section.rows.map(row => {
                      const chg = pctChange(row.current, row.prior);
                      return (
                        <tr key={row.code}>
                          <td style={{ paddingInlineStart: 'calc(var(--space-4) + 16px)', fontSize: 'var(--font-size-sm)' }}>
                            <span className="coa-code-chip">{row.code}</span>
                            {row.nameAr}
                          </td>
                          <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(row.current)}</span></td>
                          <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)' }}>{fNum(row.prior)}</span></td>
                          <td className="col-amount">
                            {chg !== null && (
                              <span style={{ fontSize: 'var(--font-size-xs)', color: chg >= 0 ? '#16a34a' : '#dc2626' }}>
                                {chg >= 0 ? '+' : ''}{chg.toFixed(1)}%
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {/* Section total */}
                    <tr key={`t-${si}`} style={{ background: headerBg, borderBlockStart: '1px solid var(--color-border)' }}>
                      <td style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)', paddingInlineStart: section.isSubtotal ? 'var(--space-4)' : 'calc(var(--space-4) + 8px)' }}>
                        {section.total}
                      </td>
                      <td className="col-amount">
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: section.totalCurrent < 0 ? '#dc2626' : section.accent === 'green' ? '#16a34a' : 'inherit' }}>
                          {section.totalCurrent < 0 ? `(${fNum(Math.abs(section.totalCurrent))})` : fNum(section.totalCurrent)}
                        </span>
                      </td>
                      <td className="col-amount">
                        <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {section.totalPrior < 0 ? `(${fNum(Math.abs(section.totalPrior))})` : fNum(section.totalPrior)}
                        </span>
                      </td>
                      <td className="col-amount">
                        {(() => {
                          const chg = pctChange(section.totalCurrent, section.totalPrior);
                          return chg !== null ? (
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: chg >= 0 ? '#16a34a' : '#dc2626' }}>
                              {chg >= 0 ? '+' : ''}{chg.toFixed(1)}%
                            </span>
                          ) : null;
                        })()}
                      </td>
                    </tr>

                    {section.isSubtotal && <tr key={`sp-${si}`}><td colSpan={4} style={{ padding: 0, height: 2, background: 'var(--color-border)' }} /></tr>}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
