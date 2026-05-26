'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  mockCollections,
  mockOrders,
  mockCustomers,
  mockCostCenters,
  INVOICE_CURRENCIES,
  INVOICE_TAX_RATES,
  COLLECTION_PAYMENT_METHOD_LABELS,
  type InvoiceType,
  type InvoiceSource,
} from '@/lib/mock-data';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LineItem {
  id:            string;
  description:   string;
  quantity:      number;
  unitPrice:     number;
  taxable:       boolean;
  taxRate:       number;
  costCenterId:  string;
}

function newLine(): LineItem {
  return { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0, taxable: true, taxRate: 15, costCenterId: '' };
}

interface FormState {
  invoiceType:               InvoiceType;
  source:                    InvoiceSource;
  collectionId:              string;
  orderId:                   string;
  customerId:                string;
  customerName:              string;
  customerPhone:             string;
  customerAddress:           string;
  customerTaxNumber:         string;
  issueDate:                 string;
  dueDate:                   string;
  currency:                  string;
  lines:                     LineItem[];
  notes:                     string;
  termsAndConditions:        string;
  generateReceiptVoucher:    boolean;
  generateAccountingEntries: boolean;
}

function defaultForm(): FormState {
  return {
    invoiceType:               'product',
    source:                    'manual',
    collectionId:              '',
    orderId:                   '',
    customerId:                '',
    customerName:              '',
    customerPhone:             '',
    customerAddress:           '',
    customerTaxNumber:         '',
    issueDate:                 new Date().toISOString().slice(0, 10),
    dueDate:                   '',
    currency:                  'SAR',
    lines:                     [newLine()],
    notes:                     '',
    termsAndConditions:        '',
    generateReceiptVoucher:    true,
    generateAccountingEntries: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function lineSubtotal(l: LineItem)  { return l.quantity * l.unitPrice; }
function lineTax(l: LineItem)       { return l.taxable ? lineSubtotal(l) * (l.taxRate / 100) : 0; }
function lineTotal(l: LineItem)     { return lineSubtotal(l) + lineTax(l); }


// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ofs-card">
      <div className="ofs-card-header"><h3 className="ofs-card-title">{title}</h3></div>
      <div className="ofs-card-body">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function NewInvoicePage() {
  const { locale }   = useParams<{ locale: string }>();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm]         = useState<FormState>(defaultForm);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [saving, setSaving]     = useState(false);
  const [saved,  setSaved]      = useState(false);
  const initialised = useRef(false);

  // Pre-fill from collection when ?collectionId= is present
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const cid = searchParams.get('collectionId');
    if (!cid) return;
    const col = mockCollections.find(c => c.id === cid);
    if (!col) return;
    setForm(f => ({
      ...f,
      source:            'collection',
      collectionId:      col.id,
      customerName:      col.customerName,
      customerPhone:     col.customerPhone ?? '',
      customerAddress:   '',
      customerTaxNumber: '',
      customerId:        '',
      currency:          col.currency,
      lines:             [{
        id:            crypto.randomUUID(),
        description:   col.match?.orderNumber ? `تحصيل مقابل طلب ${col.match.orderNumber}` : `تحصيل رقم ${col.reference}`,
        quantity:      1,
        unitPrice:     col.amount / 1.15,
        taxable:       true,
        taxRate:       15,
        costCenterId:  '',
      }],
      notes: `تم إنشاء هذه الفاتورة بناءً على التحصيل رقم ${col.reference}.${col.transactionRef ? ` رقم المعاملة: ${col.transactionRef}` : ''}`,
    }));
  }, []);

  // Patch a top-level scalar field
  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(f => ({ ...f, [key]: value }));
    if (key in errors) setErrors(e => { const ne = { ...e }; delete ne[key as string]; return ne; });
  }

  // Fill customer from DB
  function handleCustomerSelect(id: string) {
    const c = mockCustomers.find(x => x.id === id);
    if (!c) { patch('customerId', ''); return; }
    setForm(f => ({
      ...f,
      customerId:        c.id,
      customerName:      c.nameAr,
      customerPhone:     c.phone,
      customerAddress:   [c.street, c.district, c.city, c.country].filter(Boolean).join('، '),
      customerTaxNumber: c.taxNumber ?? '',
      currency:          c.currency,
    }));
  }

  // Fill from collection
  function handleCollectionSelect(id: string) {
    patch('collectionId', id);
    if (!id) return;
    const col = mockCollections.find(c => c.id === id);
    if (!col) return;
    setForm(f => ({
      ...f,
      collectionId:      col.id,
      customerName:      col.customerName,
      customerPhone:     col.customerPhone ?? '',
      customerAddress:   f.customerAddress,
      customerTaxNumber: f.customerTaxNumber,
      currency:          col.currency,
      lines: [{
        id:          crypto.randomUUID(),
        description: col.match?.orderNumber ? `تحصيل مقابل طلب ${col.match.orderNumber}` : `تحصيل رقم ${col.reference}`,
        quantity:    1,
        unitPrice:   col.amount / 1.15,
        taxable:     true,
        taxRate:     15,
        costCenterId: '',
      }],
    }));
  }

  // Fill from order
  function handleOrderSelect(id: string) {
    patch('orderId', id);
    if (!id) return;
    const ord = mockOrders.find(o => o.id === id);
    if (!ord) return;
    setForm(f => ({
      ...f,
      orderId:       ord.id,
      customerName:  ord.customerName,
      customerPhone: ord.phone,
      currency:      ord.currency,
      lines: [{
        id:          crypto.randomUUID(),
        description: `${ord.product} (${ord.orderNumber})`,
        quantity:    ord.quantity,
        unitPrice:   ord.unitPrice,
        taxable:     true,
        taxRate:     15,
        costCenterId: '',
      }],
    }));
  }

  // Line item mutations
  function updateLine<K extends keyof LineItem>(idx: number, key: K, value: LineItem[K]) {
    setForm(f => {
      const lines = f.lines.map((l, i) => i === idx ? { ...l, [key]: value } : l);
      return { ...f, lines };
    });
  }

  function addLine() {
    setForm(f => ({ ...f, lines: [...f.lines, newLine()] }));
  }

  function removeLine(idx: number) {
    setForm(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  }

  // Totals
  const subtotal   = useMemo(() => form.lines.reduce((s, l) => s + lineSubtotal(l), 0), [form.lines]);
  const totalTax   = useMemo(() => form.lines.reduce((s, l) => s + lineTax(l),      0), [form.lines]);
  const grandTotal = subtotal + totalTax;

  // Validation
  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'اسم العميل مطلوب';
    if (form.lines.length === 0)   e.lines         = 'أضف بنداً واحداً على الأقل';
    form.lines.forEach((l, i) => {
      if (!l.description.trim()) e[`line_desc_${i}`] = 'البيان مطلوب';
      if (l.quantity < 1)        e[`line_qty_${i}`]  = 'الكمية غير صحيحة';
      if (l.unitPrice <= 0)      e[`line_price_${i}`] = 'السعر غير صحيح';
    });
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        router.push(`/${locale}/accounting/invoices/preview?mock=1`);
      }, 1200);
    }, 900);
  }

  // ── Saved state ──────────────────────────────────────────────────────────
  if (saved) {
    return (
      <>
        <div className="ofs-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <div style={{ fontSize: 56, marginBlockEnd: 'var(--space-4)', color: 'var(--color-primary)' }}>✓</div>
          <p style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', marginBlockEnd: 'var(--space-2)' }}>
            تم إنشاء الفاتورة بنجاح
          </p>
          <p style={{ color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>جاري التوجيه إلى معاينة الفاتورة...</p>
          {form.generateReceiptVoucher && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: '#166534' }}>
              ✓ سيتم إنشاء سند قبض تلقائياً
            </div>
          )}
          {form.generateAccountingEntries && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: '#166534', marginBlockStart: 'var(--space-2)', marginInlineStart: 'var(--space-2)' }}>
              ✓ سيتم توليد القيود المحاسبية تلقائياً
            </div>
          )}
        </div>
      </>
    );
  }

  const approvedCollections = mockCollections.filter(c =>
    c.status === 'approved' || c.status === 'matched',
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBlockEnd: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        <Link href={`/${locale}/accounting/collections`} style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>مركز التحصيل</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)' }}>فاتورة جديدة</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBlockEnd: 'var(--space-5)' }}>
        <div>
          <h2 className="page-title">إنشاء فاتورة</h2>
          <p className="page-subtitle">إنشاء فاتورة من تحصيل أو طلب أو يدوياً</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link
            href={`/${locale}/accounting/invoices/preview?mock=1`}
            className="btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            معاينة
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="lead-form-layout">

        {/* ── Main column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Invoice type tabs */}
          <SectionCard title="نوع الفاتورة">
            <div className="inv-type-tabs">
              <button type="button" className={`inv-type-tab${form.invoiceType === 'product' ? ' active' : ''}`} onClick={() => patch('invoiceType', 'product')}>
                <span style={{ fontSize: 18, marginInlineEnd: 'var(--space-2)' }}>📦</span> فاتورة منتجات
              </button>
              <button type="button" className={`inv-type-tab${form.invoiceType === 'service' ? ' active' : ''}`} onClick={() => patch('invoiceType', 'service')}>
                <span style={{ fontSize: 18, marginInlineEnd: 'var(--space-2)' }}>🔧</span> فاتورة خدمات
              </button>
            </div>
          </SectionCard>

          {/* Invoice source */}
          <SectionCard title="مصدر الفاتورة">
            <div className="inv-source-grid">
              {(
                [
                  { value: 'collection', icon: '💳', label: 'من تحصيل', desc: 'استيراد بيانات التحصيل المعتمد' },
                  { value: 'order',      icon: '📋', label: 'من طلب',   desc: 'استيراد بيانات طلب مبيعات' },
                  { value: 'manual',     icon: '✏️', label: 'يدوي',     desc: 'إدخال يدوي من الصفر' },
                ] as { value: InvoiceSource; icon: string; label: string; desc: string }[]
              ).map(s => (
                <div
                  key={s.value}
                  className={`inv-source-card${form.source === s.value ? ' selected' : ''}`}
                  onClick={() => patch('source', s.value)}
                  role="radio"
                  aria-checked={form.source === s.value}
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && patch('source', s.value)}
                >
                  <div className="inv-source-icon" style={{ background: form.source === s.value ? 'var(--color-green-100)' : 'var(--color-surface-overlay)' }}>
                    {s.icon}
                  </div>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>{s.label}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center' }}>{s.desc}</span>
                </div>
              ))}
            </div>

            {/* Source-specific selector */}
            {form.source === 'collection' && (
              <div style={{ marginBlockStart: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">اختر التحصيل <span className="form-required">*</span></label>
                  <OfsSelect
                    options={[{ value: '', label: '— اختر تحصيلاً معتمداً —' }, ...approvedCollections.map(c => ({ value: c.id, label: `${c.reference} — ${c.customerName} — ${fNum(c.amount)} ${c.currency}` }))]}
                    value={form.collectionId}
                    onChange={handleCollectionSelect}
                    searchPlaceholder="بحث في التحصيلات..."
                    clearable
                  />
                </div>
                {form.collectionId && (() => {
                  const col = mockCollections.find(c => c.id === form.collectionId);
                  if (!col) return null;
                  return (
                    <div style={{ marginBlockStart: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>المرجع: <strong>{col.reference}</strong></span>
                      <span style={{ color: 'var(--color-text-muted)' }}>المبلغ: <strong>{fNum(col.amount)} {col.currency}</strong></span>
                      <span style={{ color: 'var(--color-text-muted)' }}>طريقة الدفع: <strong>{COLLECTION_PAYMENT_METHOD_LABELS[col.paymentMethod]}</strong></span>
                      {col.match && <span style={{ color: 'var(--color-text-muted)' }}>الطلب المطابق: <strong>{col.match.orderNumber}</strong></span>}
                    </div>
                  );
                })()}
              </div>
            )}

            {form.source === 'order' && (
              <div style={{ marginBlockStart: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">اختر الطلب <span className="form-required">*</span></label>
                  <OfsSelect
                    options={[{ value: '', label: '— اختر طلباً —' }, ...mockOrders.map(o => ({ value: o.id, label: `${o.orderNumber} — ${o.customerName} — ${fNum(o.totalAmount)} ${o.currency}` }))]}
                    value={form.orderId}
                    onChange={handleOrderSelect}
                    searchPlaceholder="بحث في الطلبات..."
                    clearable
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Customer info */}
          <SectionCard title="معلومات العميل">
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-4)' }}>
              <label className="form-label">اختر من قاعدة العملاء <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(اختياري — للملء التلقائي)</span></label>
              <OfsSelect
                options={[{ value: '', label: '— بحث في العملاء —' }, ...mockCustomers.map(c => ({ value: c.id, label: `${c.nameAr} (${c.code})` }))]}
                value={form.customerId}
                onChange={handleCustomerSelect}
                searchPlaceholder="بحث بالاسم أو الكود..."
                clearable
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">اسم العميل <span className="form-required">*</span></label>
                <input
                  type="text"
                  className={`form-input${errors.customerName ? ' form-input--error' : ''}`}
                  value={form.customerName}
                  onChange={e => patch('customerName', e.target.value)}
                  placeholder="اسم العميل أو الشركة"
                />
                {errors.customerName && <span className="form-error">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">الهاتف</label>
                <input
                  type="tel"
                  className="form-input"
                  value={form.customerPhone}
                  onChange={e => patch('customerPhone', e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label className="form-label">الرقم الضريبي</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.customerTaxNumber}
                  onChange={e => patch('customerTaxNumber', e.target.value)}
                  placeholder="3001XXXXXXXXXX03"
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label className="form-label">العنوان</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.customerAddress}
                  onChange={e => patch('customerAddress', e.target.value)}
                  placeholder="الحي، المدينة، الدولة"
                />
              </div>
            </div>
          </SectionCard>

          {/* Line items */}
          <div className="ofs-card">
            <div className="ofs-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="ofs-card-title">بنود الفاتورة</h3>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{form.lines.length} بند</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-lines-table" style={{ minInlineSize: 780 }}>
                <thead>
                  <tr>
                    <th>البيان / الوصف <span style={{ color: '#b91c1c' }}>*</span></th>
                    <th className="col-qty">الكمية</th>
                    <th className="col-price">سعر الوحدة</th>
                    <th style={{ width: 60, textAlign: 'center' }}>خاضع</th>
                    <th className="col-tax">نسبة الضريبة</th>
                    <th className="col-cc">مركز التكلفة</th>
                    <th className="col-total">الإجمالي</th>
                    <th className="col-del"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.lines.map((line, idx) => {
                    const total = lineTotal(line);
                    return (
                      <tr key={line.id}>
                        <td>
                          <input
                            type="text"
                            className={`form-input${errors[`line_desc_${idx}`] ? ' form-input--error' : ''}`}
                            style={{ blockSize: 36, fontSize: 'var(--font-size-sm)' }}
                            value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            placeholder={form.invoiceType === 'product' ? 'اسم المنتج ووصفه' : 'وصف الخدمة'}
                          />
                        </td>
                        <td className="col-qty">
                          <input
                            type="number"
                            className="form-input"
                            style={{ blockSize: 36, fontSize: 'var(--font-size-sm)', textAlign: 'center' }}
                            value={line.quantity}
                            min={1}
                            onChange={e => updateLine(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          />
                        </td>
                        <td className="col-price">
                          <input
                            type="number"
                            className={`form-input${errors[`line_price_${idx}`] ? ' form-input--error' : ''}`}
                            style={{ blockSize: 36, fontSize: 'var(--font-size-sm)', textAlign: 'end' }}
                            value={line.unitPrice === 0 ? '' : line.unitPrice}
                            min={0}
                            step="0.01"
                            placeholder="0.00"
                            onChange={e => updateLine(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={line.taxable}
                            onChange={e => updateLine(idx, 'taxable', e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                          />
                        </td>
                        <td className="col-tax">
                          <OfsSelect
                            options={INVOICE_TAX_RATES.map(r => ({ value: String(r), label: `${r}%` }))}
                            value={String(line.taxRate)}
                            onChange={v => updateLine(idx, 'taxRate', parseInt(v))}
                            size="sm"
                          />
                        </td>
                        <td className="col-cc">
                          <OfsSelect
                            options={[{ value: '', label: '— اختر —' }, ...mockCostCenters.map(cc => ({ value: cc.id, label: cc.nameAr }))]}
                            value={line.costCenterId}
                            onChange={v => updateLine(idx, 'costCenterId', v)}
                            size="sm"
                          />
                        </td>
                        <td className="col-total">
                          <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)', color: total > 0 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                            {fNum(total)}
                          </span>
                          {line.taxable && line.taxRate > 0 && line.unitPrice > 0 && (
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              +{fNum(lineTax(line))} ض.م.
                            </div>
                          )}
                        </td>
                        <td className="col-del">
                          {form.lines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b91c1c', fontSize: 18, lineHeight: 1, padding: 'var(--space-1)', borderRadius: 'var(--radius-sm)' }}
                              title="حذف البند"
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {errors.lines && (
              <div style={{ padding: 'var(--space-2) var(--space-4)', color: '#b91c1c', fontSize: 'var(--font-size-xs)' }}>{errors.lines}</div>
            )}
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderBlockStart: '1px solid var(--color-border)' }}>
              <button type="button" className="btn-ghost" onClick={addLine} style={{ fontSize: 'var(--font-size-sm)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                إضافة بند
              </button>
            </div>
          </div>

          {/* Notes */}
          <SectionCard title="ملاحظات وشروط">
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-3)' }}>
              <label className="form-label">ملاحظات الفاتورة</label>
              <textarea
                className="form-input form-textarea"
                value={form.notes}
                onChange={e => patch('notes', e.target.value)}
                placeholder="أي ملاحظات تظهر على الفاتورة..."
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">الشروط والأحكام</label>
              <textarea
                className="form-input form-textarea"
                value={form.termsAndConditions}
                onChange={e => patch('termsAndConditions', e.target.value)}
                placeholder="البضاعة المباعة لا تُستبدل ولا تُرد..."
                rows={2}
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="lead-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Invoice options */}
          <SectionCard title="إعدادات الفاتورة">
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-3)' }}>
              <label className="form-label">تاريخ الإصدار <span className="form-required">*</span></label>
              <OfsDatePicker value={form.issueDate} onChange={v => patch('issueDate', v)} />
            </div>
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-3)' }}>
              <label className="form-label">تاريخ الاستحقاق</label>
              <OfsDatePicker value={form.dueDate} onChange={v => patch('dueDate', v)} />
            </div>
            <div className="form-group">
              <label className="form-label">العملة</label>
              <OfsSelect
                options={INVOICE_CURRENCIES.map(c => ({ value: c, label: c }))}
                value={form.currency}
                onChange={v => patch('currency', v)}
              />
            </div>
          </SectionCard>

          {/* Generation options */}
          <SectionCard title="خيارات التوليد التلقائي">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {[
                { key: 'generateReceiptVoucher',    label: 'إنشاء سند قبض',          desc: 'يُنشئ سند استلام مرتبط بالفاتورة' },
                { key: 'generateAccountingEntries', label: 'توليد القيود المحاسبية',  desc: 'يُضيف القيود في دفتر اليومية' },
              ].map(opt => (
                <label
                  key={opt.key}
                  style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', cursor: 'pointer', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: `1px solid ${form[opt.key as keyof FormState] ? 'var(--color-green-300)' : 'var(--color-border)'}`, background: form[opt.key as keyof FormState] ? 'var(--color-green-50)' : 'var(--color-surface)', transition: 'all var(--transition-fast)' }}
                >
                  <input
                    type="checkbox"
                    checked={form[opt.key as keyof FormState] as boolean}
                    onChange={e => patch(opt.key as keyof FormState, e.target.checked as never)}
                    style={{ marginBlockStart: 2, accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div>
                    <p style={{ margin: 0, fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-sm)' }}>{opt.label}</p>
                    <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </SectionCard>

          {/* Financial summary */}
          <SectionCard title="ملخص مالي">
            <div>
              <div className="inv-summary-row">
                <span style={{ color: 'var(--color-text-muted)' }}>المجموع قبل الضريبة</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fNum(subtotal)} {form.currency}</span>
              </div>
              <div className="inv-summary-row">
                <span style={{ color: 'var(--color-text-muted)' }}>إجمالي الضريبة (ض.م.م)</span>
                <span style={{ color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>{fNum(totalTax)} {form.currency}</span>
              </div>
              <div className="inv-summary-row total">
                <span>الإجمالي الكلي</span>
                <span style={{ color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>{fNum(grandTotal)} {form.currency}</span>
              </div>
            </div>
          </SectionCard>

          {/* Action buttons */}
          <div className="ofs-card">
            <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button type="submit" className="btn-cta" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'جاري الإنشاء...' : 'إصدار الفاتورة'}
              </button>
              <button
                type="submit"
                className="btn-outline"
                style={{ width: '100%' }}
                disabled={saving}
                onClick={() => {
                  // Save as draft via special flag — same handler
                }}
              >
                حفظ كمسودة
              </button>
              <Link
                href={`/${locale}/accounting/invoices/preview?mock=1`}
                className="btn-ghost"
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block', padding: '10px 0', fontSize: 'var(--font-size-sm)' }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginInlineEnd: 6, verticalAlign: 'middle' }}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                معاينة قبل الإصدار
              </Link>
              <Link
                href={`/${locale}/accounting/collections`}
                style={{ width: '100%', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', textDecoration: 'none', display: 'block', paddingBlock: 'var(--space-2)' }}
              >
                إلغاء والعودة
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
