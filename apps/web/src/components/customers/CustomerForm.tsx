'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Customer, CustomerStatus, CustomerType } from '@/lib/mock-data';
import { CUSTOMER_TAGS, TAG_COLORS } from '@/lib/mock-data';
import OfsSelect from '@/components/ui/OfsSelect';

const COUNTRIES = [
  'المملكة العربية السعودية', 'الإمارات العربية المتحدة', 'الكويت',
  'قطر', 'البحرين', 'عُمان', 'الأردن', 'مصر', 'لبنان', 'العراق',
];

const CURRENCIES = ['SAR', 'AED', 'KWD', 'QAR', 'BHD', 'USD', 'EUR'];

const SALESPERSONS = ['سالم الخالدي', 'نورا المطيري', 'أحمد القحطاني', 'فاطمة الزهراني'];

interface FormState {
  code: string;
  nameAr: string;
  nameEn: string;
  type: CustomerType;
  status: CustomerStatus;
  phone: string;
  phone2: string;
  email: string;
  country: string;
  city: string;
  district: string;
  street: string;
  taxNumber: string;
  commercialRegNumber: string;
  currency: string;
  creditLimit: string;
  assignedSalesperson: string;
  tags: string[];
}

function toFormState(c?: Partial<Customer>): FormState {
  return {
    code:                   c?.code                   ?? '',
    nameAr:                 c?.nameAr                 ?? '',
    nameEn:                 c?.nameEn                 ?? '',
    type:                   c?.type                   ?? 'company',
    status:                 c?.status                 ?? 'active',
    phone:                  c?.phone                  ?? '',
    phone2:                 c?.phone2                 ?? '',
    email:                  c?.email                  ?? '',
    country:                c?.country                ?? 'المملكة العربية السعودية',
    city:                   c?.city                   ?? '',
    district:               c?.district               ?? '',
    street:                 c?.street                 ?? '',
    taxNumber:              c?.taxNumber              ?? '',
    commercialRegNumber:    c?.commercialRegNumber    ?? '',
    currency:               c?.currency               ?? 'SAR',
    creditLimit:            c?.creditLimit != null ? String(c.creditLimit) : '',
    assignedSalesperson:    c?.assignedSalesperson    ?? '',
    tags:                   c?.tags                   ?? [],
  };
}

interface CustomerFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Customer>;
  backHref: string;
}

export default function CustomerForm({ mode, initialData, backHref }: CustomerFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialData));
  const [saved, setSaved]   = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function toggleTag(tag: string) {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!form.nameAr.trim()) next.nameAr = 'مطلوب';
    if (!form.phone.trim())  next.phone  = 'مطلوب';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setTimeout(() => router.push(backHref), 1400);
  }

  const inp = (f: keyof FormState) => `form-input${errors[f] ? ' form-input--error' : ''}`;

  const isCommercial = form.type === 'company' || form.type === 'government';

  if (saved) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minBlockSize: 320, gap: 'var(--space-4)' }}>
        <div style={{ inlineSize: 64, blockSize: 64, borderRadius: '50%', background: 'var(--color-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
          {mode === 'create' ? 'تم إنشاء العميل بنجاح' : 'تم حفظ التعديلات بنجاح'}
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

          {/* المعلومات الأساسية */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">المعلومات الأساسية</p>
            <div className="form-grid-2">

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  الاسم بالعربية <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input className={inp('nameAr')} value={form.nameAr}
                  onChange={e => set('nameAr', e.target.value)} placeholder="شركة النخبة للتجارة" />
                {errors.nameAr && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.nameAr}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">الاسم بالإنجليزية</label>
                <input className={inp('nameEn')} value={form.nameEn}
                  onChange={e => set('nameEn', e.target.value)} placeholder="Al-Nukhba Trading Co."
                  dir="ltr" style={{ textAlign: 'start' }} />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">كود العميل</label>
                <input className={inp('code')} value={form.code}
                  onChange={e => set('code', e.target.value)} placeholder="CUS-XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
                <p className="form-hint">يُنشأ تلقائياً إن تُرك فارغاً</p>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">نوع العميل</label>
                <OfsSelect
                  options={[{ value: 'company', label: 'شركة' }, { value: 'individual', label: 'فرد' }, { value: 'government', label: 'جهة حكومية' }]}
                  value={form.type}
                  onChange={v => set('type', v as CustomerType)}
                />
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">معلومات الاتصال</p>
            <div className="form-grid-2">

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  الهاتف الرئيسي <span style={{ color: 'var(--color-status-rejected)' }}>*</span>
                </label>
                <input className={inp('phone')} value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+966 1X XXX XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
                {errors.phone && <p className="form-hint" style={{ color: 'var(--color-status-rejected)' }}>{errors.phone}</p>}
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">الهاتف الثاني</label>
                <input className={inp('phone2')} value={form.phone2}
                  onChange={e => set('phone2', e.target.value)} placeholder="+966 5X XXX XXXX"
                  dir="ltr" style={{ textAlign: 'start' }} />
              </div>

              <div className="form-group form-col-span-2" style={{ margin: 0 }}>
                <label className="form-label">البريد الإلكتروني</label>
                <input type="email" className={inp('email')} value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="info@company.com"
                  dir="ltr" style={{ textAlign: 'start' }} />
              </div>
            </div>
          </div>

          {/* العنوان */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">العنوان</p>
            <div className="form-grid-2">

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
                <input className={inp('city')} value={form.city}
                  onChange={e => set('city', e.target.value)} placeholder="الرياض" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">الحي / المنطقة</label>
                <input className={inp('district')} value={form.district}
                  onChange={e => set('district', e.target.value)} placeholder="حي العليا" />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">الشارع والمبنى</label>
                <input className={inp('street')} value={form.street}
                  onChange={e => set('street', e.target.value)} placeholder="شارع التخصصي، مبنى 42" />
              </div>
            </div>
          </div>

          {/* المعلومات التجارية */}
          {isCommercial && (
            <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
              <p className="lead-form-section-title">المعلومات التجارية</p>
              <div className="form-grid-2">

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">الرقم الضريبي</label>
                  <input className={inp('taxNumber')} value={form.taxNumber}
                    onChange={e => set('taxNumber', e.target.value)} placeholder="3XXXXXXXXXXXXX3"
                    dir="ltr" style={{ textAlign: 'start' }} />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">رقم السجل التجاري</label>
                  <input className={inp('commercialRegNumber')} value={form.commercialRegNumber}
                    onChange={e => set('commercialRegNumber', e.target.value)} placeholder="1010XXXXXX"
                    dir="ltr" style={{ textAlign: 'start' }} />
                </div>
              </div>
            </div>
          )}

          {/* المعلومات المالية */}
          <div className="ofs-card" style={{ padding: 'var(--space-6)' }}>
            <p className="lead-form-section-title">المعلومات المالية</p>
            <div className="form-grid-2">

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">العملة</label>
                <OfsSelect
                  options={CURRENCIES.map(c => ({ value: c, label: c }))}
                  value={form.currency}
                  onChange={v => set('currency', v)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">حد الائتمان</label>
                <input type="number" min="0" className={inp('creditLimit')} value={form.creditLimit}
                  onChange={e => set('creditLimit', e.target.value)} placeholder="100,000"
                  dir="ltr" />
                <p className="form-hint">اتركه فارغاً إذا لم يكن هناك حد ائتمان</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="lead-form-sidebar">

          {/* الحالة والتعيين */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <p className="lead-form-section-title" style={{ marginBlockEnd: 'var(--space-4)' }}>الحالة والتعيين</p>

            <div className="form-group">
              <label className="form-label">الحالة</label>
              <OfsSelect
                options={[{ value: 'active', label: 'نشط' }, { value: 'inactive', label: 'غير نشط' }, { value: 'blocked', label: 'محظور' }]}
                value={form.status}
                onChange={v => set('status', v as CustomerStatus)}
              />
            </div>

            <div className="form-group" style={{ marginBlockEnd: 0 }}>
              <label className="form-label">المندوب المسؤول</label>
              <OfsSelect
                options={[{ value: '', label: '— غير مُعيّن —' }, ...SALESPERSONS.map(s => ({ value: s, label: s }))]}
                value={form.assignedSalesperson}
                onChange={v => set('assignedSalesperson', v)}
                clearable
              />
            </div>
          </div>

          {/* العلامات */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)' }}>
            <p className="lead-form-section-title" style={{ marginBlockEnd: 'var(--space-3)' }}>العلامات</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {CUSTOMER_TAGS.map(tag => {
                const checked = form.tags.includes(tag);
                const colors  = TAG_COLORS[tag];
                return (
                  <label key={tag} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    cursor: 'pointer', padding: '4px 0',
                  }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleTag(tag)}
                      style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }} />
                    <span className="tag-chip" style={{
                      background: colors?.bg, color: colors?.color,
                      borderColor: colors?.border, border: '1px solid',
                    }}>
                      {tag}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* الأزرار */}
          <div className="ofs-card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button type="submit" className="btn-primary">
              {mode === 'create' ? 'إنشاء العميل' : 'حفظ التعديلات'}
            </button>
            <button type="button" className="btn-outline" onClick={() => router.push(backHref)}>
              إلغاء
            </button>
          </div>

          {mode === 'edit' && (
            <div className="ofs-card" style={{ padding: 'var(--space-4)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-2)' }}>إجراءات متقدمة</p>
              <button type="button" className="btn-ghost"
                style={{ color: 'var(--color-status-rejected)', inlineSize: '100%', justifyContent: 'flex-start' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                حذف العميل
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
