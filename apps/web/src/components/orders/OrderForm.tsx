'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Order, OrderStatus } from '@/lib/mock-data';
import {
  mockCustomers,
  ORDER_STATUS_LABELS,
  ORDER_PAYMENT_LABELS,
  ORDER_CURRENCIES,
  ORDER_SHIPPING_LABELS,
} from '@/lib/mock-data';
import OrderStatusBadge from './OrderStatusBadge';
import OfsSelect from '@/components/ui/OfsSelect';
import OfsDatePicker from '@/components/ui/OfsDatePicker';
import { fNum } from '@/lib/format';
import { OfsButton } from '@/components/auth/OfsButton';

interface Props {
  mode: 'create' | 'edit';
  initialData?: Partial<Order>;
  backHref: string;
}

const SALES_REPS = ['أحمد محمد', 'سارة الأحمد', 'خالد العمري', 'محمد الفهد', 'فاطمة السيد'];

function toFormState(d?: Partial<Order>) {
  return {
    customerId:             d?.customerId             ?? '',
    customerName:           d?.customerName           ?? '',
    phone:                  d?.phone                  ?? '',
    country:                d?.country                ?? '',
    city:                   d?.city                   ?? '',
    address:                d?.address                ?? '',
    externalOrderId:        d?.externalOrderId        ?? '',
    orderDate:              d?.orderDateIso            ?? new Date().toISOString().slice(0, 10),
    product:                d?.product                ?? '',
    quantity:               d?.quantity               ?? 1,
    unitPrice:              d?.unitPrice              ?? 0,
    paidAmount:             d?.paidAmount             ?? 0,
    currency:               d?.currency               ?? 'SAR',
    paymentMethod:          d?.paymentMethod          ?? 'cash',
    receipt:                d?.receipt                ?? '',
    shippingMethod:         d?.shippingMethod         ?? '',
    shippingTrackingNumber: d?.shippingTrackingNumber ?? '',
    expectedDeliveryDate:   d?.expectedDeliveryDate   ?? '',
    notes:                  d?.notes                  ?? '',
    status:                 (d?.status                ?? 'confirmed') as OrderStatus,
    assignedTo:             d?.assignedTo             ?? '',
  };
}

export default function OrderForm({ mode, initialData, backHref }: Props) {
  const router = useRouter();
  const [form, setForm]     = useState(toFormState(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const totalAmount = useMemo(
    () => (form.quantity as number) * (form.unitPrice as number),
    [form.quantity, form.unitPrice],
  );

  const remaining = totalAmount - (form.paidAmount as number);

  function set(k: keyof typeof form, v: string | number) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const ne = { ...e }; delete ne[k]; return ne; });
  }

  function handleCustomerSelect(id: string) {
    if (!id) { set('customerId', ''); return; }
    const c = mockCustomers.find(x => x.id === id);
    if (!c) return;
    setForm(f => ({
      ...f,
      customerId:   c.id,
      customerName: c.nameAr,
      phone:        c.phone,
      country:      c.country,
      city:         c.city,
      address:      [c.street, c.district, c.city].filter(Boolean).join('، '),
    }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = 'اسم العميل مطلوب';
    if (!form.phone.trim())        e.phone        = 'الهاتف مطلوب';
    if (!form.product.trim())      e.product      = 'المنتج مطلوب';
    if ((form.quantity as number) < 1) e.quantity = 'الكمية غير صحيحة';
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
      setTimeout(() => router.push(backHref), 1400);
    }, 900);
  }

  if (saved) {
    return (
      <div className="ofs-card" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <div style={{ fontSize: 48, marginBlockEnd: 'var(--space-3)', color: 'var(--color-primary)' }}>✓</div>
        <p style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-lg)' }}>
          {mode === 'create' ? 'تم إنشاء الطلب بنجاح' : 'تم حفظ التعديلات بنجاح'}
        </p>
        <p style={{ color: 'var(--color-text-muted)', marginBlockStart: 'var(--space-1)' }}>جاري التوجيه...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lead-form-layout" noValidate>

      {/* ── Main column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Customer */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات العميل</h3></div>
          <div className="ofs-card-body">
            <div className="form-group" style={{ marginBlockEnd: 'var(--space-4)' }}>
              <label className="form-label">
                اختر من قاعدة العملاء
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginInlineStart: 4 }}>(اختياري — للملء التلقائي)</span>
              </label>
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
                  onChange={e => set('customerName', e.target.value)}
                  placeholder="اسم العميل أو الشركة"
                />
                {errors.customerName && <span className="form-error">{errors.customerName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">الهاتف <span className="form-required">*</span></label>
                <input
                  type="tel"
                  className={`form-input${errors.phone ? ' form-input--error' : ''}`}
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+966 5X XXX XXXX"
                  dir="ltr"
                />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">الدولة</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="السعودية"
                />
              </div>
              <div className="form-group">
                <label className="form-label">المدينة</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="الرياض"
                />
              </div>
              <div className="form-group form-col-span-2">
                <label className="form-label">العنوان</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="الحي، الشارع، رقم المبنى"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">تفاصيل الطلب</h3></div>
          <div className="ofs-card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">رقم الطلب الخارجي</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.externalOrderId}
                  onChange={e => set('externalOrderId', e.target.value)}
                  placeholder="EXT-XXXXX"
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ الطلب <span className="form-required">*</span></label>
                <OfsDatePicker value={form.orderDate} onChange={v => set('orderDate', v)} />
              </div>
              <div className="form-group form-col-span-2">
                <label className="form-label">المنتج / الخدمة <span className="form-required">*</span></label>
                <input
                  type="text"
                  className={`form-input${errors.product ? ' form-input--error' : ''}`}
                  value={form.product}
                  onChange={e => set('product', e.target.value)}
                  placeholder="وصف المنتج أو الخدمة"
                />
                {errors.product && <span className="form-error">{errors.product}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">الكمية <span className="form-required">*</span></label>
                <input
                  type="number"
                  className={`form-input${errors.quantity ? ' form-input--error' : ''}`}
                  value={form.quantity}
                  min="1"
                  onChange={e => set('quantity', parseInt(e.target.value) || 1)}
                />
                {errors.quantity && <span className="form-error">{errors.quantity}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">سعر الوحدة ({form.currency})</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.unitPrice}
                  min="0"
                  step="0.01"
                  onChange={e => set('unitPrice', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div style={{
              marginBlockStart: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>إجمالي الطلب</span>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', fontVariantNumeric: 'tabular-nums' }}>
                {fNum(totalAmount)} {form.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات الدفع</h3></div>
          <div className="ofs-card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">العملة</label>
                <OfsSelect options={ORDER_CURRENCIES.map(c => ({ value: c, label: c }))} value={form.currency} onChange={v => set('currency', v)} />
              </div>
              <div className="form-group">
                <label className="form-label">طريقة الدفع</label>
                <OfsSelect options={Object.entries(ORDER_PAYMENT_LABELS).map(([k, v]) => ({ value: k, label: v }))} value={form.paymentMethod} onChange={v => set('paymentMethod', v)} />
              </div>
              <div className="form-group">
                <label className="form-label">المبلغ المدفوع</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.paidAmount}
                  min="0"
                  step="0.01"
                  onChange={e => set('paidAmount', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الإيصال</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.receipt}
                  onChange={e => set('receipt', e.target.value)}
                  placeholder="REC-XXXXX"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">معلومات الشحن</h3></div>
          <div className="ofs-card-body">
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">طريقة الشحن</label>
                <OfsSelect
                  options={[{ value: '', label: '— اختر طريقة الشحن —' }, ...Object.entries(ORDER_SHIPPING_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
                  value={form.shippingMethod}
                  onChange={v => set('shippingMethod', v)}
                  clearable
                />
              </div>
              <div className="form-group">
                <label className="form-label">رقم التتبع</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.shippingTrackingNumber}
                  onChange={e => set('shippingTrackingNumber', e.target.value)}
                  placeholder="TRK-XXXXXXXX"
                  dir="ltr"
                />
              </div>
              <div className="form-group">
                <label className="form-label">تاريخ التسليم المتوقع</label>
                <OfsDatePicker value={form.expectedDeliveryDate} onChange={v => set('expectedDeliveryDate', v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">ملاحظات</h3></div>
          <div className="ofs-card-body">
            <div className="form-group">
              <textarea
                className="form-textarea form-input"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="أي ملاحظات إضافية على الطلب..."
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="lead-form-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Status + actions */}
        <div className="ofs-card">
          <div className="ofs-card-header"><h3 className="ofs-card-title">الحالة والإجراءات</h3></div>
          <div className="ofs-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">حالة الطلب</label>
              <OfsSelect
                options={(Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).map(([k, v]) => ({ value: k, label: v }))}
                value={form.status}
                onChange={v => set('status', v as OrderStatus)}
              />
              <div style={{ marginBlockStart: 'var(--space-2)' }}>
                <OrderStatusBadge status={form.status} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">المندوب المسؤول</label>
              <OfsSelect
                options={[{ value: '', label: '— اختر المندوب —' }, ...SALES_REPS.map(r => ({ value: r, label: r }))]}
                value={form.assignedTo}
                onChange={v => set('assignedTo', v)}
                clearable
              />
            </div>
            <OfsButton
              type="submit"
              variant="primary"
              className="btn-cta"
              style={{ width: '100%' }}
              loading={saving}
              loadingText="جاري الحفظ..."
            >
              {mode === 'create' ? 'إنشاء الطلب' : 'حفظ التعديلات'}
            </OfsButton>
            <a
              href={backHref}
              className="btn-outline"
              style={{ width: '100%', textAlign: 'center', display: 'block', textDecoration: 'none', padding: '10px 0' }}
            >
              إلغاء
            </a>
            {mode === 'edit' && (
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--color-status-rejected)',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  color: 'var(--color-status-rejected)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-base)',
                }}
                onClick={() => router.push(backHref)}
              >
                حذف الطلب
              </button>
            )}
          </div>
        </div>

        {/* Financial summary */}
        {totalAmount > 0 && (
          <div className="ofs-card">
            <div className="ofs-card-header"><h3 className="ofs-card-title">ملخص مالي</h3></div>
            <div className="ofs-card-body">
              <div className="order-financial-grid">
                <div className="order-financial-cell">
                  <span className="order-financial-label">الإجمالي</span>
                  <span className="order-financial-value">{fNum(totalAmount)}</span>
                </div>
                <div className="order-financial-cell">
                  <span className="order-financial-label">المدفوع</span>
                  <span className="order-financial-value">{fNum(form.paidAmount as number)}</span>
                </div>
                <div className="order-financial-cell" style={{ gridColumn: 'span 2' }}>
                  <span className="order-financial-label">المتبقي</span>
                  <span className={`order-financial-value ${remaining === 0 ? 'value-settled' : 'value-remaining'}`}>
                    {remaining === 0
                      ? `مُسوَّى بالكامل ✓`
                      : `${fNum(remaining)} ${form.currency}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
