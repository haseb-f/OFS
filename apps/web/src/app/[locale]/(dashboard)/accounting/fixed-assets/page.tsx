'use client';

import { useMemo, useState } from 'react';
import { fNum } from '@/lib/format';

// ── Mock data ─────────────────────────────────────────────────────────────────

type AssetStatus = 'active' | 'disposed' | 'fully_depreciated';

const STATUS_LABELS: Record<AssetStatus, string> = {
  active:             'نشط',
  disposed:           'مُستغنى عنه',
  fully_depreciated:  'مستهلك كلياً',
};

const STATUS_CLASS: Record<AssetStatus, string> = {
  active:            'status-active',
  disposed:          'status-cancelled',
  fully_depreciated: 'status-completed',
};

interface FixedAsset {
  id: string;
  code: string;
  nameAr: string;
  categoryAr: string;
  purchaseDate: string;
  cost: number;
  salvageValue: number;
  usefulLife: number;
  accDepreciation: number;
  bookValue: number;
  depRate: number;
  status: AssetStatus;
  location: string;
}

const MOCK_ASSETS: FixedAsset[] = [
  { id: 'fa-001', code: 'FA-0001', nameAr: 'مجموعة أثاث مكتبي تنفيذي',    categoryAr: 'أثاث ومعدات',      purchaseDate: '01 Jan 2025', cost: 24000, salvageValue: 2000, usefulLife: 5, accDepreciation:  5500, bookValue: 18500, depRate: 20, status: 'active',            location: 'المكتب الرئيسي' },
  { id: 'fa-002', code: 'FA-0002', nameAr: 'أثاث قسم المبيعات',            categoryAr: 'أثاث ومعدات',      purchaseDate: '15 Mar 2025', cost: 18000, salvageValue: 1500, usefulLife: 5, accDepreciation:  3800, bookValue: 14200, depRate: 20, status: 'active',            location: 'قسم المبيعات' },
  { id: 'fa-003', code: 'FA-0003', nameAr: 'أجهزة حاسب Dell — 10 أجهزة',  categoryAr: 'أجهزة حاسب آلي',   purchaseDate: '01 Jan 2025', cost: 55000, salvageValue: 5000, usefulLife: 3, accDepreciation: 16000, bookValue: 39000, depRate: 33, status: 'active',            location: 'جميع الأقسام' },
  { id: 'fa-004', code: 'FA-0004', nameAr: 'خادم الشركة وأجهزة الشبكة',    categoryAr: 'أجهزة حاسب آلي',   purchaseDate: '15 Jun 2025', cost: 45000, salvageValue: 3000, usefulLife: 4, accDepreciation:  3000, bookValue: 42000, depRate: 25, status: 'active',            location: 'غرفة الخادم' },
  { id: 'fa-005', code: 'FA-0005', nameAr: 'طابعات وماسحات ضوئية',         categoryAr: 'أجهزة حاسب آلي',   purchaseDate: '01 Mar 2024', cost: 12000, salvageValue:  500, usefulLife: 3, accDepreciation:  8500, bookValue:  3500, depRate: 33, status: 'active',            location: 'قسم الإدارة' },
  { id: 'fa-006', code: 'FA-0006', nameAr: 'سيارة مرسيدس للتوصيل',         categoryAr: 'مركبات',            purchaseDate: '01 Sep 2023', cost: 85000, salvageValue: 15000, usefulLife: 5, accDepreciation: 35000, bookValue: 50000, depRate: 20, status: 'active',            location: 'المستودع' },
  { id: 'fa-007', code: 'FA-0007', nameAr: 'حاسب محمول مدير قديم',         categoryAr: 'أجهزة حاسب آلي',   purchaseDate: '01 Jan 2022', cost:  8000, salvageValue:   500, usefulLife: 3, accDepreciation:  8000, bookValue:     0, depRate: 33, status: 'fully_depreciated', location: 'المستودع' },
  { id: 'fa-008', code: 'FA-0008', nameAr: 'طاولة اجتماعات كبيرة',         categoryAr: 'أثاث ومعدات',      purchaseDate: '01 Jun 2023', cost:  9000, salvageValue:   800, usefulLife: 7, accDepreciation:  2200, bookValue:  6800, depRate: 14, status: 'active',            location: 'قاعة الاجتماعات' },
  { id: 'fa-009', code: 'FA-0009', nameAr: 'مكيفات مركزية — الطابق الثاني', categoryAr: 'معدات',             purchaseDate: '01 Apr 2024', cost: 32000, salvageValue: 3000, usefulLife: 8, accDepreciation:  3000, bookValue: 29000, depRate: 12, status: 'active',            location: 'الطابق الثاني' },
  { id: 'fa-010', code: 'FA-0010', nameAr: 'معدات مستودع قديمة',           categoryAr: 'معدات',             purchaseDate: '01 Jan 2020', cost: 15000, salvageValue: 1000, usefulLife: 4, accDepreciation: 15000, bookValue:     0, depRate: 25, status: 'disposed',          location: '—' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(MOCK_ASSETS.map(a => a.categoryAr)))];
const STATUSES:   Array<{ val: AssetStatus | 'all'; label: string }> = [
  { val: 'all',             label: 'الكل' },
  { val: 'active',          label: 'نشط' },
  { val: 'fully_depreciated', label: 'مستهلك كلياً' },
  { val: 'disposed',        label: 'مُستغنى عنه' },
];

export default function FixedAssetsPage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('الكل');
  const [status,   setStatus]   = useState<AssetStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return MOCK_ASSETS.filter(a => {
      if (category !== 'الكل' && a.categoryAr !== category) return false;
      if (status   !== 'all'  && a.status !== status)       return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!a.nameAr.includes(q) && !a.code.toLowerCase().includes(q) && !a.categoryAr.includes(q)) return false;
      }
      return true;
    });
  }, [search, category, status]);

  const totalCost  = MOCK_ASSETS.filter(a => a.status !== 'disposed').reduce((s, a) => s + a.cost, 0);
  const totalDep   = MOCK_ASSETS.filter(a => a.status !== 'disposed').reduce((s, a) => s + a.accDepreciation, 0);
  const totalBook  = MOCK_ASSETS.filter(a => a.status !== 'disposed').reduce((s, a) => s + a.bookValue, 0);
  const activeCount = MOCK_ASSETS.filter(a => a.status === 'active').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">الأصول الثابتة</h2>
          <p className="page-subtitle">{MOCK_ASSETS.length} أصل — {activeCount} نشط</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          أصل جديد
        </button>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#1d4ed8' }}>{fNum(totalCost, 0)}</div>
          <div className="kpi-card-label">إجمالي التكلفة (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#b45309' }}>{fNum(totalDep, 0)}</div>
          <div className="kpi-card-label">إجمالي الاستهلاك المتراكم (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#16a34a' }}>{fNum(totalBook, 0)}</div>
          <div className="kpi-card-label">صافي القيمة الدفترية (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value">{activeCount}</div>
          <div className="kpi-card-label">أصول نشطة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="je-filters-search" style={{ flex: 2 }}>
          <input
            type="search"
            placeholder="بحث بالاسم أو الكود أو التصنيف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="ofs-input"
          />
        </div>
        <div className="je-filters-controls">
          <select value={category} onChange={e => setCategory(e.target.value)} className="ofs-input">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="ofs-input">
            {STATUSES.map(s => <option key={s.val} value={s.val}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 1000 }}>
            <thead>
              <tr>
                <th>الكود</th>
                <th style={{ minInlineSize: 240 }}>اسم الأصل</th>
                <th>التصنيف</th>
                <th>تاريخ الشراء</th>
                <th className="col-amount">التكلفة (ر.س)</th>
                <th className="col-amount">الاستهلاك المتراكم (ر.س)</th>
                <th className="col-amount">القيمة الدفترية (ر.س)</th>
                <th style={{ textAlign: 'center' }}>معدل الاستهلاك</th>
                <th>الموقع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>
                    لا توجد أصول مطابقة
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td><span className="coa-code-chip">{a.code}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>{a.nameAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{a.categoryAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>{a.purchaseDate}</td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(a.cost)}</span></td>
                  <td className="col-amount">
                    <span style={{ fontVariantNumeric: 'tabular-nums', color: '#b45309' }}>
                      {fNum(a.accDepreciation)}
                    </span>
                  </td>
                  <td className="col-amount">
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-semibold)', color: a.bookValue === 0 ? 'var(--color-text-muted)' : '#16a34a' }}>
                      {fNum(a.bookValue)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 99, background: '#fffbeb', color: '#b45309', fontWeight: 'var(--font-weight-medium)' }}>
                      {a.depRate}%
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{a.location}</td>
                  <td>
                    <span className={`status-badge ${STATUS_CLASS[a.status]}`} style={{ fontSize: 'var(--font-size-xs)' }}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={4} className="totals-label">الإجمالي</td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(filtered.reduce((s, a) => s + a.cost, 0))}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', color: '#b45309' }}>{fNum(filtered.reduce((s, a) => s + a.accDepreciation, 0))}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', color: '#16a34a', fontWeight: 'var(--font-weight-bold)' }}>{fNum(filtered.reduce((s, a) => s + a.bookValue, 0))}</span></td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
