'use client';

import { useMemo, useState } from 'react';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

// ── Mock data ─────────────────────────────────────────────────────────────────

type ExpenseStatus = 'paid' | 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<ExpenseStatus, string> = {
  paid:     'مدفوع',
  pending:  'معلق',
  approved: 'معتمد',
  rejected: 'مرفوض',
};
const STATUS_CLASS: Record<ExpenseStatus, string> = {
  paid:     'status-completed',
  pending:  'status-pending',
  approved: 'status-active',
  rejected: 'status-cancelled',
};

interface Expense {
  id: string;
  ref: string;
  date: string;
  dateIso: string;
  categoryAr: string;
  descriptionAr: string;
  amount: number;
  vatAmount: number;
  total: number;
  paidBy: string;
  paymentMethod: string;
  status: ExpenseStatus;
  accountCode: string;
  costCenter: string;
}

const MOCK_EXPENSES: Expense[] = [
  { id: 'ex-001', ref: 'EXP-2026-001', date: '10 Jan 2026', dateIso: '2026-01-10', categoryAr: 'رواتب وأجور',       descriptionAr: 'رواتب شهر يناير 2026',               amount:  29000, vatAmount: 0,    total:  29000, paidBy: 'فيصل الدوسري', paymentMethod: 'تحويل بنكي', status: 'paid',     accountCode: '510101', costCenter: 'الإدارة العامة' },
  { id: 'ex-002', ref: 'EXP-2026-002', date: '15 Jan 2026', dateIso: '2026-01-15', categoryAr: 'إيجار',              descriptionAr: 'إيجار المكتب — يناير 2026',           amount:   8000, vatAmount: 0,    total:   8000, paidBy: 'فيصل الدوسري', paymentMethod: 'تحويل بنكي', status: 'paid',     accountCode: '510102', costCenter: 'الإدارة العامة' },
  { id: 'ex-003', ref: 'EXP-2026-003', date: '15 Jan 2026', dateIso: '2026-01-15', categoryAr: 'إيجار',              descriptionAr: 'إيجار المكتب — فبراير 2026',          amount:   8000, vatAmount: 0,    total:   8000, paidBy: 'فيصل الدوسري', paymentMethod: 'تحويل بنكي', status: 'paid',     accountCode: '510102', costCenter: 'الإدارة العامة' },
  { id: 'ex-004', ref: 'EXP-2026-004', date: '10 Feb 2026', dateIso: '2026-02-10', categoryAr: 'رواتب وأجور',       descriptionAr: 'رواتب شهر فبراير 2026',               amount:  29000, vatAmount: 0,    total:  29000, paidBy: 'فيصل الدوسري', paymentMethod: 'تحويل بنكي', status: 'paid',     accountCode: '510101', costCenter: 'الإدارة العامة' },
  { id: 'ex-005', ref: 'EXP-2026-005', date: '15 Mar 2026', dateIso: '2026-03-15', categoryAr: 'إعلان وتسويق',      descriptionAr: 'حملة تسويقية رقمية — مارس',           amount:   4000, vatAmount: 600,  total:   4600, paidBy: 'أحمد محمد',    paymentMethod: 'بطاقة ائتمانية', status: 'paid',  accountCode: '510105', costCenter: 'المبيعات الإلكترونية' },
  { id: 'ex-006', ref: 'EXP-2026-006', date: '10 Apr 2026', dateIso: '2026-04-10', categoryAr: 'كهرباء ومياه',      descriptionAr: 'فاتورة الكهرباء والمياه الربع الأول', amount:   2800, vatAmount: 420,  total:   3220, paidBy: 'أحمد محمد',    paymentMethod: 'نقداً',          status: 'paid',  accountCode: '510103', costCenter: 'الإدارة العامة' },
  { id: 'ex-007', ref: 'EXP-2026-007', date: '05 May 2026', dateIso: '2026-05-05', categoryAr: 'اتصالات وإنترنت',   descriptionAr: 'فاتورة الاتصالات — مايو 2026',        amount:   1600, vatAmount: 240,  total:   1840, paidBy: 'أحمد محمد',    paymentMethod: 'نقداً',          status: 'paid',  accountCode: '510104', costCenter: 'الإدارة العامة' },
  { id: 'ex-008', ref: 'EXP-2026-008', date: '18 May 2026', dateIso: '2026-05-18', categoryAr: 'مصروفات مالية',     descriptionAr: 'عمولات وفوائد بنكية — مايو',          amount:   6000, vatAmount: 0,    total:   6000, paidBy: 'فيصل الدوسري', paymentMethod: 'خصم مصرفي',      status: 'paid',  accountCode: '520101', costCenter: 'المالية والمحاسبة' },
  { id: 'ex-009', ref: 'EXP-2026-009', date: '20 May 2026', dateIso: '2026-05-20', categoryAr: 'صيانة وإصلاح',      descriptionAr: 'صيانة أجهزة الحاسب',                  amount:   3500, vatAmount: 525,  total:   4025, paidBy: 'أحمد محمد',    paymentMethod: 'بطاقة ائتمانية', status: 'approved', accountCode: '530102', costCenter: 'الإدارة العامة' },
  { id: 'ex-010', ref: 'EXP-2026-010', date: '22 May 2026', dateIso: '2026-05-22', categoryAr: 'رواتب وأجور',       descriptionAr: 'رواتب شهر مايو 2026',                 amount:  29000, vatAmount: 0,    total:  29000, paidBy: 'فيصل الدوسري', paymentMethod: 'تحويل بنكي', status: 'pending',  accountCode: '510101', costCenter: 'الإدارة العامة' },
  { id: 'ex-011', ref: 'EXP-2026-011', date: '23 May 2026', dateIso: '2026-05-23', categoryAr: 'قرطاسية ومكتبية',  descriptionAr: 'مستلزمات مكتبية متنوعة',               amount:   1200, vatAmount: 180,  total:   1380, paidBy: 'نورة الشمري',  paymentMethod: 'نقداً',          status: 'pending',  accountCode: '530101', costCenter: 'الإدارة العامة' },
  { id: 'ex-012', ref: 'EXP-2026-012', date: '24 May 2026', dateIso: '2026-05-24', categoryAr: 'وقود ومواصلات',     descriptionAr: 'وقود المركبات — مايو',                 amount:   2200, vatAmount: 330,  total:   2530, paidBy: 'ناصر المطيري', paymentMethod: 'بطاقة وقود',     status: 'approved', accountCode: '510106', costCenter: 'العمليات واللوجستيات' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(MOCK_EXPENSES.map(e => e.categoryAr)))];

export default function ExpensesPage() {
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('الكل');
  const [status,   setStatus]   = useState<ExpenseStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const filtered = useMemo(() => {
    return MOCK_EXPENSES.filter(e => {
      if (category !== 'الكل'  && e.categoryAr !== category) return false;
      if (status   !== 'all'   && e.status !== status)       return false;
      if (dateFrom && e.dateIso < dateFrom) return false;
      if (dateTo   && e.dateIso > dateTo)   return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!e.descriptionAr.includes(q) && !e.ref.toLowerCase().includes(q) && !e.categoryAr.includes(q)) return false;
      }
      return true;
    });
  }, [search, category, status, dateFrom, dateTo]);

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);
  const totalVat    = filtered.reduce((s, e) => s + e.vatAmount, 0);
  const totalAll    = filtered.reduce((s, e) => s + e.total, 0);
  const pendingAmt  = MOCK_EXPENSES.filter(e => e.status === 'pending').reduce((s, e) => s + e.total, 0);

  const hasFilters = search || category !== 'الكل' || status !== 'all' || dateFrom || dateTo;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">المصروفات</h2>
          <p className="page-subtitle">{MOCK_EXPENSES.length} قيد مصروف — إجمالي {fNum(MOCK_EXPENSES.reduce((s, e) => s + e.total, 0), 0)} ر.س</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          مصروف جديد
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#dc2626' }}>{fNum(MOCK_EXPENSES.reduce((s, e) => s + e.total, 0), 0)}</div>
          <div className="kpi-card-label">إجمالي المصروفات (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#b45309' }}>{fNum(pendingAmt, 0)}</div>
          <div className="kpi-card-label">مصروفات معلقة (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value" style={{ color: '#64748b' }}>{fNum(MOCK_EXPENSES.reduce((s, e) => s + e.vatAmount, 0), 0)}</div>
          <div className="kpi-card-label">ضريبة القيمة المضافة (ر.س)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-value">{MOCK_EXPENSES.filter(e => e.status === 'paid').length}</div>
          <div className="kpi-card-label">قيود مدفوعة</div>
        </div>
      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="je-filters-search" style={{ flex: 2 }}>
          <input
            type="search"
            placeholder="بحث بالوصف أو المرجع أو التصنيف..."
            value={search}
            onChange={e => { setSearch(e.target.value); }}
            className="ofs-input"
          />
        </div>
        <div className="je-filters-controls">
          <select value={category} onChange={e => setCategory(e.target.value)} className="ofs-input">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value as typeof status)} className="ofs-input">
            <option value="all">كل الحالات</option>
            {(Object.entries(STATUS_LABELS) as [ExpenseStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="je-date-range">
            <OfsDatePicker value={dateFrom} onChange={setDateFrom} aria-label="من تاريخ" />
            <span className="je-date-range-sep">—</span>
            <OfsDatePicker value={dateTo} onChange={setDateTo} aria-label="إلى تاريخ" />
          </div>
          {hasFilters && (
            <button type="button" className="btn-ghost" onClick={() => { setSearch(''); setCategory('الكل'); setStatus('all'); setDateFrom(''); setDateTo(''); }}>
              مسح
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 950 }}>
            <thead>
              <tr>
                <th>المرجع</th>
                <th>التاريخ</th>
                <th>التصنيف</th>
                <th style={{ minInlineSize: 220 }}>الوصف</th>
                <th>مركز التكلفة</th>
                <th className="col-amount">المبلغ (ر.س)</th>
                <th className="col-amount">ضريبة (ر.س)</th>
                <th className="col-amount">الإجمالي (ر.س)</th>
                <th>طريقة الدفع</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>لا توجد مصروفات مطابقة</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>{e.ref}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{e.date}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 99, background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)' }}>{e.categoryAr}</span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.descriptionAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{e.costCenter}</td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(e.amount)}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', color: e.vatAmount > 0 ? '#b45309' : 'var(--color-text-muted)' }}>{e.vatAmount > 0 ? fNum(e.vatAmount) : '—'}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-semibold)' }}>{fNum(e.total)}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{e.paymentMethod}</td>
                  <td><span className={`status-badge ${STATUS_CLASS[e.status]}`} style={{ fontSize: 'var(--font-size-xs)' }}>{STATUS_LABELS[e.status]}</span></td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} className="totals-label">الإجمالي ({filtered.length} قيد)</td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(totalAmount)}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', color: '#b45309' }}>{fNum(totalVat)}</span></td>
                  <td className="col-amount"><span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-bold)', color: '#dc2626' }}>{fNum(totalAll)}</span></td>
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
