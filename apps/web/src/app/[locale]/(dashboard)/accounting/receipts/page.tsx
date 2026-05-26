'use client';

import { useMemo, useState } from 'react';
import { fNum } from '@/lib/format';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

// ── Mock data ─────────────────────────────────────────────────────────────────

type ReceiptStatus = 'posted' | 'draft' | 'void';
type ReceiptType   = 'customer' | 'other';

const STATUS_LABELS: Record<ReceiptStatus, string> = { posted: 'مرحّل', draft: 'مسودة', void: 'ملغي' };
const STATUS_CLASS:  Record<ReceiptStatus, string> = { posted: 'journal-status-posted', draft: 'journal-status-draft', void: 'journal-status-void' };

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'تحويل بنكي',
  cash:          'نقداً',
  card:          'بطاقة ائتمانية',
  cheque:        'شيك',
};

interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  dateIso: string;
  partyAr: string;
  partyType: ReceiptType;
  accountCode: string;
  descriptionAr: string;
  amount: number;
  currency: string;
  method: string;
  bankRef?: string;
  status: ReceiptStatus;
  postedBy: string;
}

const MOCK_RECEIPTS: Receipt[] = [
  { id: 'rc-001', receiptNo: 'REC-2026-001', date: '12 Jan 2026', dateIso: '2026-01-12', partyAr: 'شركة النخبة للتجارة',           partyType: 'customer', accountCode: '110102', descriptionAr: 'دفعة على INV-0201',                  amount:  30000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-001', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-002', receiptNo: 'REC-2026-002', date: '01 Feb 2026', dateIso: '2026-02-01', partyAr: 'مستشفى الحياة التخصصي',        partyType: 'customer', accountCode: '110102', descriptionAr: 'دفعة جزئية INV-0105',                amount:  50000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-002', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-003', receiptNo: 'REC-2026-003', date: '15 Mar 2026', dateIso: '2026-03-15', partyAr: 'شركة النخبة للتجارة',           partyType: 'customer', accountCode: '110103', descriptionAr: 'دفعة على INV-0215',                  amount:  20000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-003', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-004', receiptNo: 'REC-2026-004', date: '01 Apr 2026', dateIso: '2026-04-01', partyAr: 'عملاء محليون متنوعون',          partyType: 'customer', accountCode: '110103', descriptionAr: 'تحصيل دفعات شهر أبريل',             amount:  25000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-004', status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'rc-005', receiptNo: 'REC-2026-005', date: '05 May 2026', dateIso: '2026-05-05', partyAr: 'شركة النخبة للتجارة',           partyType: 'customer', accountCode: '110101', descriptionAr: 'دفعة نقدية INV-0241',                amount:  15000, currency: 'SAR', method: 'cash',          status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'rc-006', receiptNo: 'REC-2026-006', date: '10 May 2026', dateIso: '2026-05-10', partyAr: 'شركة التقنية المتقدمة',         partyType: 'customer', accountCode: '110102', descriptionAr: 'دفعة على فاتورة خليجية',            amount:  18000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-006', status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-007', receiptNo: 'REC-2026-007', date: '15 May 2026', dateIso: '2026-05-15', partyAr: 'وزارة الشؤون البلدية',         partyType: 'customer', accountCode: '110102', descriptionAr: 'أمر دفع حكومي — REC-0801',          amount: 800000, currency: 'SAR', method: 'bank_transfer', bankRef: 'GOV-PAY-07',  status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-008', receiptNo: 'REC-2026-008', date: '20 May 2026', dateIso: '2026-05-20', partyAr: 'شركة الفجر للمقاولات',          partyType: 'customer', accountCode: '110102', descriptionAr: 'دفعة جزئية على INV-1101',           amount:  30000, currency: 'SAR', method: 'cheque',        bankRef: 'CHQ-0041',   status: 'posted', postedBy: 'فيصل الدوسري' },
  { id: 'rc-009', receiptNo: 'REC-2026-009', date: '22 May 2026', dateIso: '2026-05-22', partyAr: 'شركة الخليج للإلكترونيات',      partyType: 'customer', accountCode: '110103', descriptionAr: 'تسوية رصيد مستحق',                  amount:  12000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-009', status: 'draft',  postedBy: 'أحمد محمد' },
  { id: 'rc-010', receiptNo: 'REC-2026-010', date: '24 May 2026', dateIso: '2026-05-24', partyAr: 'مستشفى الحياة التخصصي',        partyType: 'customer', accountCode: '110102', descriptionAr: 'دفعة على العقد السنوي',              amount:  35000, currency: 'SAR', method: 'bank_transfer', bankRef: 'BNKREF-010', status: 'draft',  postedBy: 'أحمد محمد' },
  { id: 'rc-011', receiptNo: 'REC-2026-011', date: '14 Mar 2026', dateIso: '2026-03-14', partyAr: 'محمد أحمد الزهراني',           partyType: 'customer', accountCode: '110101', descriptionAr: 'دفعة نقدية كاملة',                  amount:   8500, currency: 'SAR', method: 'cash',          status: 'posted', postedBy: 'أحمد محمد' },
  { id: 'rc-012', receiptNo: 'REC-2026-012', date: '02 Mar 2026', dateIso: '2026-03-02', partyAr: 'عميل خليجي متنوع',             partyType: 'customer', accountCode: '110102', descriptionAr: 'مردود — قيد ملغي',                   amount:   5000, currency: 'SAR', method: 'bank_transfer', status: 'void',   postedBy: 'فيصل الدوسري' },
];

export default function ReceiptsPage() {
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState<ReceiptStatus | 'all'>('all');
  const [method,   setMethod]   = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [page,     setPage]     = useState(1);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return MOCK_RECEIPTS.filter(r => {
      if (status !== 'all' && r.status !== status) return false;
      if (method !== 'all' && r.method !== method) return false;
      if (dateFrom && r.dateIso < dateFrom) return false;
      if (dateTo   && r.dateIso > dateTo)   return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!r.partyAr.includes(q) && !r.receiptNo.toLowerCase().includes(q) && !r.descriptionAr.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => b.dateIso.localeCompare(a.dateIso));
  }, [search, status, method, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const postedTotal = MOCK_RECEIPTS.filter(r => r.status === 'posted').reduce((s, r) => s + r.amount, 0);
  const draftTotal  = MOCK_RECEIPTS.filter(r => r.status === 'draft').reduce((s, r) => s + r.amount, 0);
  const displayTotal = filtered.reduce((s, r) => s + r.amount, 0);

  const hasFilters = search || status !== 'all' || method !== 'all' || dateFrom || dateTo;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">الإيصالات</h2>
          <p className="page-subtitle">{MOCK_RECEIPTS.filter(r => r.status === 'posted').length} إيصال مرحّل — إجمالي {fNum(postedTotal, 0)} ر.س</p>
        </div>
        <button type="button" className="btn-cta">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          إيصال جديد
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBlockEnd: 'var(--space-5)' }}>
        <div className="kpi-card"><div className="kpi-card-value" style={{ color: '#16a34a' }}>{fNum(postedTotal, 0)}</div><div className="kpi-card-label">إجمالي المحصّل (ر.س)</div></div>
        <div className="kpi-card"><div className="kpi-card-value" style={{ color: '#64748b' }}>{fNum(draftTotal, 0)}</div><div className="kpi-card-label">مسودات (ر.س)</div></div>
        <div className="kpi-card"><div className="kpi-card-value">{MOCK_RECEIPTS.filter(r => r.status === 'posted').length}</div><div className="kpi-card-label">إيصالات مرحّلة</div></div>
        <div className="kpi-card"><div className="kpi-card-value">{MOCK_RECEIPTS.filter(r => r.status === 'draft').length}</div><div className="kpi-card-label">مسودات</div></div>
      </div>

      {/* Filters */}
      <div className="ofs-card je-filters-toolbar" style={{ marginBlockEnd: 'var(--space-4)' }}>
        <div className="je-filters-search" style={{ flex: 2 }}>
          <input type="search" placeholder="بحث برقم الإيصال أو الطرف أو الوصف..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="ofs-input" />
        </div>
        <div className="je-filters-controls">
          <select value={status} onChange={e => { setStatus(e.target.value as typeof status); setPage(1); }} className="ofs-input">
            <option value="all">كل الحالات</option>
            {(Object.entries(STATUS_LABELS) as [ReceiptStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={method} onChange={e => { setMethod(e.target.value); setPage(1); }} className="ofs-input">
            <option value="all">كل طرق الدفع</option>
            {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="je-date-range">
            <OfsDatePicker value={dateFrom} onChange={v => { setDateFrom(v); setPage(1); }} aria-label="من تاريخ" />
            <span className="je-date-range-sep">—</span>
            <OfsDatePicker value={dateTo} onChange={v => { setDateTo(v); setPage(1); }} aria-label="إلى تاريخ" />
          </div>
          {hasFilters && <button type="button" className="btn-ghost" onClick={() => { setSearch(''); setStatus('all'); setMethod('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>مسح</button>}
        </div>
      </div>

      {/* Table */}
      <div className="ofs-card" style={{ overflow: 'hidden', marginBlockEnd: 'var(--space-4)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="acc-table" style={{ minInlineSize: 900 }}>
            <thead>
              <tr>
                <th>رقم الإيصال</th>
                <th>التاريخ</th>
                <th style={{ minInlineSize: 200 }}>الطرف</th>
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
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>لا توجد إيصالات مطابقة</td></tr>
              ) : paginated.map(r => (
                <tr key={r.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>{r.receiptNo}</span></td>
                  <td style={{ fontSize: 'var(--font-size-sm)', whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)' }}>{r.partyAr}</td>
                  <td style={{ fontSize: 'var(--font-size-sm)', maxInlineSize: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-muted)' }}>{r.descriptionAr}</td>
                  <td style={{ fontSize: 'var(--font-size-xs)' }}>{METHOD_LABELS[r.method] ?? r.method}</td>
                  <td>{r.bankRef ? <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', padding: '1px 5px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>{r.bankRef}</span> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}</td>
                  <td className="col-amount"><span className="amount-credit">{fNum(r.amount)}</span></td>
                  <td><span className={`status-badge ${STATUS_CLASS[r.status]}`} style={{ fontSize: 'var(--font-size-xs)' }}>{STATUS_LABELS[r.status]}</span></td>
                  <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{r.postedBy}</td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={6} className="totals-label">الإجمالي المعروض ({filtered.length})</td>
                  <td className="col-amount"><span className="amount-balanced">{fNum(displayTotal)}</span></td>
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
