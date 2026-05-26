'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead, LeadStatus, LeadCurrency, LeadPaymentMethod } from '@/lib/mock-data';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';

const COUNTRIES = [
  'المملكة العربية السعودية',
  'الإمارات العربية المتحدة',
  'الكويت',
  'قطر',
  'البحرين',
  'عُمان',
  'الأردن',
  'مصر',
  'لبنان',
  'العراق',
];

const CURRENCIES: { value: LeadCurrency; label: string }[] = [
  { value: 'SAR', label: 'ريال سعودي (SAR)' },
  { value: 'AED', label: 'درهم إماراتي (AED)' },
  { value: 'KWD', label: 'دينار كويتي (KWD)' },
  { value: 'QAR', label: 'ريال قطري (QAR)' },
  { value: 'BHD', label: 'دينار بحريني (BHD)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' },
];

const PAYMENT_METHODS: { value: LeadPaymentMethod; label: string }[] = [
  { value: 'cash',          label: 'نقداً' },
  { value: 'bank_transfer', label: 'تحويل بنكي' },
  { value: 'card',          label: 'بطاقة ائتمانية' },
  { value: 'installment',   label: 'أقساط' },
];

const STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'new',         label: 'جديد' },
  { value: 'in_progress', label: 'قيد المعالجة' },
  { value: 'pending',     label: 'معلق' },
  { value: 'won',         label: 'مُحوّل' },
  { value: 'lost',        label: 'خسارة' },
  { value: 'cancelled',   label: 'ملغي' },
];

interface FormState {
  externalOrderId: string;
  orderDate: string;
  customerName: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  product: string;
  quantity: string;
  paidAmount: string;
  currency: LeadCurrency;
  paymentMethod: LeadPaymentMethod;
  receipt: string;
  notes: string;
  status: LeadStatus;
  assignedTo: string;
}

function toFormState(lead?: Partial<Lead>): FormState {
  return {
    externalOrderId: lead?.externalOrderId ?? '',
    orderDate:       lead?.orderDate       ?? '',
    customerName:    lead?.customerName    ?? '',
    country:         lead?.country         ?? 'المملكة العربية السعودية',
    city:            lead?.city            ?? '',
    address:         lead?.address         ?? '',
    phone:           lead?.phone           ?? '',
    product:         lead?.product         ?? '',
    quantity:        lead?.quantity        != null ? String(lead.quantity) : '',
    paidAmount:      lead?.paidAmount      != null ? String(lead.paidAmount) : '',
    currency:        lead?.currency        ?? 'SAR',
    paymentMethod:   lead?.paymentMethod   ?? 'bank_transfer',
    receipt:         lead?.receipt         ?? '',
    notes:           lead?.notes           ?? '',
    status:          lead?.status          ?? 'new',
    assignedTo:      lead?.assignedTo      ?? '',
  };
}

interface LeadFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Lead>;
  backHref: string;
}

export default function LeadForm({ mode, initialData, backHref }: LeadFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialData));
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.customerName.trim()) next.customerName = 'مطلوب';
    if (!form.phone.trim())        next.phone        = 'مطلوب';
    if (!form.product.trim())      next.product      = 'مطلوب';
    if (!form.quantity || Number(form.quantity) < 1) next.quantity = 'أدخل كمية صحيحة';
    if (!form.paidAmount || Number(form.paidAmount) < 0) next.paidAmount = 'أدخل مبلغاً صحيحاً';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => router.push(backHref), 1400);
  }

  const inputCls = (field: keyof FormState) =>
    `form-input${errors[field] ? ' form-input--error' : ''}`;

  if (saved) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minBlockSize: '320px', gap: 'var(--space-4)',
      }}>
        <div style={{
          inlineSize: 64, blockSize: 64, borderRadius: '50%',
          background: 'var(--color-primary-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
          {mode === 'create' ? 'تم إنشاء العميل المحتمل بنجاح' : 'تم حفظ التعديلات بنجاح'}
        </p>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>جارٍ التوجيه…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="lead-form-layout">
        {/* ── Main column ── */}
        <div className="lead-form-section">

          {/* بيانات العميل */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">بيانات العميل</p>
            <div className="form-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  اسم العميل <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input className={inputCls('customerName')} value={form.customerName}
                  onChange={e => set('customerName', e.target.value)} placeholder="محمد أحمد العمري" />
                {errors.customerName && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.customerName}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  رقم الهاتف <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input className={inputCls('phone')} value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+966 5X XXX XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
                {errors.phone && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.phone}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">البلد</label>
                <OfsSelect
                  options={COUNTRIES.map(c => ({ value: c, label: c }))}
                  value={form.country}
                  onChange={v => set('country', v)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">المدينة</label>
                <input className={inputCls('city')} value={form.city}
                  onChange={e => set('city', e.target.value)} placeholder="الرياض" />
              </div>

              <div className="form-group form-col-span-2" style={{ margin: 0 }}>
                <label className="form-label">العنوان التفصيلي</label>
                <textarea className="form-textarea" value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="الحي، الشارع، رقم المبنى…" rows={2} />
              </div>
            </div>
          </div>

          {/* بيانات الطلب */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">بيانات الطلب</p>
            <div className="form-grid-2">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">رقم الطلب الخارجي</label>
                <input className={inputCls('externalOrderId')} value={form.externalOrderId}
                  onChange={e => set('externalOrderId', e.target.value)} placeholder="ORD-2026-XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">تاريخ الطلب</label>
                <OfsDatePicker value={form.orderDate} onChange={v => set('orderDate', v)} />
              </div>

              <div className="form-group form-col-span-2" style={{ margin: 0 }}>
                <label className="form-label">
                  المنتج / الخدمة <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input className={inputCls('product')} value={form.product}
                  onChange={e => set('product', e.target.value)} placeholder="اسم المنتج أو الخدمة" />
                {errors.product && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.product}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  الكمية <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input type="number" min="1" className={inputCls('quantity')} value={form.quantity}
                  onChange={e => set('quantity', e.target.value)} placeholder="1" dir="ltr" />
                {errors.quantity && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.quantity}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  المبلغ المدفوع <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input type="number" min="0" step="0.01" className={inputCls('paidAmount')} value={form.paidAmount}
                  onChange={e => set('paidAmount', e.target.value)} placeholder="0.00" dir="ltr" />
                {errors.paidAmount && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.paidAmount}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">العملة</label>
                <OfsSelect
                  options={CURRENCIES.map(c => ({ value: c.value, label: c.label }))}
                  value={form.currency}
                  onChange={v => set('currency', v as LeadCurrency)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">طريقة الدفع</label>
                <OfsSelect
                  options={PAYMENT_METHODS.map(m => ({ value: m.value, label: m.label }))}
                  value={form.paymentMethod}
                  onChange={v => set('paymentMethod', v as LeadPaymentMethod)}
                />
              </div>

              <div className="form-group form-col-span-2" style={{ margin: 0 }}>
                <label className="form-label">رقم الإيصال / المرجع</label>
                <input className={inputCls('receipt')} value={form.receipt}
                  onChange={e => set('receipt', e.target.value)} placeholder="REC-2026-XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
                <p className="form-hint">اختياري — رقم إيصال الدفع أو رقم المرجع الخارجي</p>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">ملاحظات</p>
            <div className="form-group" style={{ margin: 0 }}>
              <textarea className="form-textarea" value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="أي ملاحظات إضافية حول العميل أو الطلب…"
                rows={4} style={{ minBlockSize: 110 }} />
            </div>
          </div>
        </div>

        {/* ── Sidebar column ── */}
        <div className="lead-form-sidebar">
          {/* الحالة والتعيين */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <p className="lead-form-section-title" style={{ marginBlockEnd: 'var(--space-4)' }}>الحالة والتعيين</p>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <OfsSelect
                options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
                value={form.status}
                onChange={v => set('status', v as LeadStatus)}
              />
            </div>

            <div className="form-group" style={{ marginBlockEnd: 0 }}>
              <label className="form-label">مُعيّن إلى</label>
              <input className="form-input" value={form.assignedTo}
                onChange={e => set('assignedTo', e.target.value)} placeholder="اسم المندوب" />
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-primary">
              {mode === 'create' ? 'إنشاء العميل المحتمل' : 'حفظ التعديلات'}
            </button>
            <button type="button" className="btn-outline"
              onClick={() => router.push(backHref)}>
              إلغاء
            </button>
          </div>

          {mode === 'edit' && (
            <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-3)' }}>
                إجراءات متقدمة
              </p>
              <button type="button" className="btn-ghost"
                style={{ color: 'var(--color-status-rejected)', inlineSize: '100%', justifyContent: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                حذف العميل المحتمل
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
