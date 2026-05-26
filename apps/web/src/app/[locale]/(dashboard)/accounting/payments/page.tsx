'use client';

import { useMemo, useState } from 'react';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

// ── Mock data ─────────────────────────────────────────────────────────────────

type PaymentStatus = 'posted' | 'draft' | 'void';

const STATUS_LABELS: Record<PaymentStatus, string> = { posted: 'مرحّل', draft: 'مسودة', void: 'ملغي' };
const STATUS_CLASS:  Record<PaymentStatus, string> = { posted: 'journal-status-posted', draft: 'journal-status-draft', void: 'journal-status-void' };

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'تحويل بنكي',
  cash:          'نقداً',
  card:          'بطاقة ائتمانية',
  cheque:        'شيك',
  bank_debit:    'خصم مصرفي',
};

type PaymentType = 'vendor' | 'expense' | 'other';

interface Payment {
  id: string;
  paymentNo: string;
  date: string;
  dateIso: string;
  partyAr: string;
  partyType: PaymentType;
  descriptionAr: string;
  amount: number;
  currency: string;
  method: string;
  bankRef?: string;
  status: PaymentStatus;
  postedBy: string;
  accountCode: string;
}

const MOCK_PAYMENTS: Payment[] = [
  { id: 'py-001', paymentNo: 'PAY-2026-001', date: '10 Jan 2026', dateIso: '2026-01-10', partyAr: 'موظفون (رواتب)',              partyType: 'expense', accountCode: '110102', descriptionAr: 'رواتب يناير 2026',                  amount:  29000, currency: 'SAR', method: 'bank_transfer', bankRef: 'PAYROLL-JAN', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-002', paymentNo: 'PAY-2026-002', date: '15 Jan 2026', dateIso: '2026-01-15', partyAr: 'شركة العقارات المتميزة',     partyType: 'expense', accountCode: '110102', descriptionAr: 'إيجار المكتب — يناير',               amount:   8000, currency: 'SAR', method: 'bank_transfer', bankRef: 'RENT-JAN',    status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-003', paymentNo: 'PAY-2026-003', date: '10 Feb 2026', dateIso: '2026-02-10', partyAr: 'موظفون (رواتب)',              partyType: 'expense', accountCode: '110102', descriptionAr: 'رواتب فبراير 2026',                 amount:  29000, currency: 'SAR', method: 'bank_transfer', bankRef: 'PAYROLL-FEB', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-004', paymentNo: 'PAY-2026-004', date: '15 Feb 2026', dateIso: '2026-02-15', partyAr: 'شركة العقارات المتميزة',     partyType: 'expense', accountCode: '110102', descriptionAr: 'إيجار المكتب — فبراير',              amount:   8000, currency: 'SAR', method: 'bank_transfer', bankRef: 'RENT-FEB',    status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-005', paymentNo: 'PAY-2026-005', date: '05 Mar 2026', dateIso: '2026-03-05', partyAr: 'مؤسسة الأمل للتجارة',        partyType: 'vendor',  accountCode: '110102', descriptionAr: 'تسديد دفعة مورد — PO-0045',         amount:  30000, currency: 'SAR', method: 'bank_transfer', bankRef: 'VND-PAY-012', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-006', paymentNo: 'PAY-2026-006', date: '15 Mar 2026', dateIso: '2026-03-15', partyAr: 'شركة الإعلام الرقمي',        partyType: 'expense', accountCode: '110101', descriptionAr: 'حملة إعلانية مارس',                  amount:   4000, currency: 'SAR', method: 'cash',          status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'py-007', paymentNo: 'PAY-2026-007', date: '10 Apr 2026', dateIso: '2026-04-10', partyAr: 'شركة الكهرباء السعودية',     partyType: 'expense', accountCode: '110101', descriptionAr: 'فاتورة كهرباء ومياه Q1',             amount:   2800, currency: 'SAR', method: 'cash',          status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'py-008', paymentNo: 'PAY-2026-008', date: '10 Mar 2026', dateIso: '2026-03-10', partyAr: 'موظفون (رواتب)',              partyType: 'expense', accountCode: '110102', descriptionAr: 'رواتب مارس 2026',                   amount:  29000, currency: 'SAR', method: 'bank_transfer', bankRef: 'PAYROLL-MAR', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-009', paymentNo: 'PAY-2026-009', date: '05 May 2026', dateIso: '2026-05-05', partyAr: 'شركة الاتصالات المتكاملة',   partyType: 'expense', accountCode: '110101', descriptionAr: 'فاتورة الاتصالات مايو',              amount:   1600, currency: 'SAR', method: 'cash',          status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'py-010', paymentNo: 'PAY-2026-010', date: '18 May 2026', dateIso: '2026-05-18', partyAr: 'البنك الأهلي',               partyType: 'expense', accountCode: '110102', descriptionAr: 'فوائد وعمولات بنكية',                amount:   6000, currency: 'SAR', method: 'bank_debit',   bankRef: 'BANK-CHG-05', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'py-011', paymentNo: 'PAY-2026-011', date: '22 May 2026', dateIso: '2026-05-22', partyAr: 'موظفون (رواتب)',              partyType: 'expense', accountCode: '110102', descriptionAr: 'رواتب مايو 2026 — مسودة',           amount:  29000, currency: 'SAR', method: 'bank_transfer', bankRef: 'PAYROLL-MAY', status: 'draft',  postedBy: 'أحمد محمد' },
  { id: 'py-012', paymentNo: 'PAY-2026-012', date: '20 Mar 2026', dateIso: '2026-03-20', partyAr: 'مورد خاطئ',                  partyType: 'vendor',  accountCode: '110102', descriptionAr: 'مدفوعة بالخطأ — ملغاة',             amount:   5000, currency: 'SAR', method: 'bank_transfer', status: 'void',   postedBy: 'فيصل الدوسري' },
];

const PARTY_TYPES: Array<{ val: PaymentType | 'all'; label: string }> = [
  { val: 'all', label: 'الكل' }, { val: 'vendor', label: 'موردون' }, { val: 'expense', label: 'مصروفات' }, { val: 'other', label: 'أخرى' },
];

export default function PaymentsPage() {
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState<PaymentStatus | 'all'>('all');
  const [pType,    setPType]    = useState<PaymentType | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return MOCK_PAYMENTS.filter(p => {
      if (status !== 'all' && p.status !== status)    return false;
      if (pType  !== 'all' && p.partyType !== pType)  return false;
      if (dateFrom && p.dateIso < dateFrom) return false;
      if (dateTo   && p.dateIso > dateTo)   return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!p.partyAr.includes(q) && !p.paymentNo.toLowerCase().includes(q) && !p.descriptionAr.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  }, [search, status, pType, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const postedTotal = MOCK_PAYMENTS.filter(p => p.status === 'posted').reduce((s, p) => s + p.amount, 0);
  const draftTotal  = MOCK_PAYMENTS.filter(p => p.status === 'draft').reduce((s, p) => s + p.amount, 0);
  const displayTotal = filtered.reduce((s, p) => s + p.amount, 0);

  const hasFilters = search || status !== 'all' || pType !== 'all' || dateFrom || dateTo;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">المدفوعات</h2>
          <p className="page-subtitle">{MOCK_PAYMENTS.filter(p => p.status === 'posted').length} دفعة مرحّلة — إجمالي {fNum(postedTotal, 0)} ر.س</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          دفعة جديدة
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        <div className="kpi-card"><div className="kpi-card-value" style={{ color: '#dc2626' }}>{fNum(postedTotal, 0)}</div><div className="kpi-card-label">إجمالي المدفوعات (ر.س)</div></div>
        <div className="kpi-card"><div className="kpi-card-value" style={{ color: '#64748b' }}>{fNum(draftTotal, 0)}</div><div className="kpi-card-label">مسودات (ر.س)</div></div>
        <div className="kpi-card"><div className="kpi-card-value">{MOCK_PAYMENTS.filter(p => p.status === 'posted').length}</div><div className="kpi-card-label">مدفوعات مرحّلة</div></div>
        <div className="kpi-card"><div className="kpi-card-value">{MOCK_PAYMENTS.filter(p => p.partyType === 'vendor').length}</div><div className="kpi-card-label">مدفوعات للموردين</div></div>
      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="je-filters-search" style={{ flex: 2 }}>
          <input type="search" placeholder="بحث برقم الدفعة أو الطرف أو الوصف..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ofs-input" />
        </div>
        <div className="je-filters-controls">
          <select value={status} onChange={e => { setStatus(e.target.value as typeof status); setPage(1); }} className="ofs-input">
            <option value="all">كل الحالات</option>
            {(Object.entries(STATUS_LABELS) as [PaymentStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={pType} onChange={e => { setPType(e.target.value as typeof pType); setPage(1); }} className="ofs-input">
            {PARTY_TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
          </select>
          <div className="je-date-range">
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} aria-label="من تاريخ" />
            <span className="je-date-range-sep">—</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} aria-label="إلى تاريخ" />
          </div>
          {hasFilters && <button type="button" className="btn-ghost" onClick={() => { setSearch(''); setStatus('all'); setPType('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>مسح</button>}
        </div>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden', marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 900 }}>
            <thead>
              <tr>
                <th>رقم الدفعة</th>
                <th>التاريخ</th>
                <th style={{ minInlineSize: 180 }}>الطرف</th>
                <th>النوع</th>
                <th style={{ minInlineSize: 200 }}>الوصف</th>
                <th>طريقة الدفع</th>
                <th>المرجع البنكي</th>
                <th className="col-amount">المبلغ (ر.س)</th>
                <th>الحالة</th>
                <th>بواسطة</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>لا توجد مدفوعات مطابقة</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>{p.paymentNo}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{p.date}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{p.partyAr}</td>
                  <td>
                    <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 8px', borderRadius: 99, background: p.partyType === 'vendor' ? '#fef2f2' : '#f0fdf4', color: p.partyType === 'vendor' ? '#b91c1c' : '#166534' }}>
                      {p.partyType === 'vendor' ? 'مورد' : p.partyType === 'expense' ? 'مصروف' : 'أخرى'}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>{p.descriptionAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>{METHOD_LABELS[p.method] ?? p.method}</td>
                  <td>{p.bankRef ? <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '1px 5px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>{p.bankRef}</span> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                  <td className="col-amount"><span className="amount-debit">{fNum(p.amount)}</span></td>
                  <td><span className={`status-badge ${STATUS_CLASS[p.status]}`} style={{ fontSize: 'var(--font-size-xs)' }}>{STATUS_LABELS[p.status]}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{p.postedBy}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={7} className="totals-label">الإجمالي المعروض ({filtered.length})</td>
                  <td className="col-amount"><span className="amount-unbalanced">{fNum(displayTotal)}</span></td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button className="btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>السابق</button>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{page} / {totalPages}</span>
          <button className="btn-outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</button>
        </div>
      )}
    </>
  );
}
