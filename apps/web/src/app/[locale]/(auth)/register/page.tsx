'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { OfsPasswordInput } from '@/components/auth/OfsPasswordInput';
import { OfsButton } from '@/components/auth/OfsButton';

type Plan = 'basic' | 'professional' | 'enterprise';

interface FormData {
  // Step 1
  ownerNameAr: string;
  ownerNameEn: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerPassword: string;
  ownerPasswordConfirm: string;
  // Step 2
  brandNameAr: string;
  brandNameEn: string;
  brandSlug: string;
  // Step 3
  companyNameAr: string;
  companyNameEn: string;
  taxNumber: string;
  // Step 4
  plan: Plan;
  agreed: boolean;
}

const PLANS: { id: Plan; labelAr: string; priceAr: string; features: string[] }[] = [
  {
    id: 'basic',
    labelAr: 'الأساسية',
    priceAr: 'مجاني',
    features: ['شركة واحدة', 'فرع واحد', '5 مستخدمين'],
  },
  {
    id: 'professional',
    labelAr: 'الاحترافية',
    priceAr: '299 ر.س / شهر',
    features: ['3 شركات', '10 فروع', '25 مستخدم'],
  },
  {
    id: 'enterprise',
    labelAr: 'المؤسسية',
    priceAr: '999 ر.س / شهر',
    features: ['شركات غير محدودة', 'فروع غير محدودة', 'مستخدمون غير محدودون'],
  },
];

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState<FormData>({
    ownerNameAr: '', ownerNameEn: '', ownerEmail: '', ownerPhone: '',
    ownerPassword: '', ownerPasswordConfirm: '',
    brandNameAr: '', brandNameEn: '', brandSlug: '',
    companyNameAr: '', companyNameEn: '', taxNumber: '',
    plan: 'basic', agreed: false,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  }

  function autoSlug(nameAr: string) {
    set('brandSlug', toSlug(nameAr));
  }

  function validateStep(): string {
    if (step === 1) {
      if (!form.ownerNameAr) return 'الاسم بالعربية مطلوب';
      if (!form.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) return 'بريد إلكتروني غير صالح';
      if (form.ownerPassword.length < 8) return 'كلمة المرور 8 أحرف على الأقل';
      if (form.ownerPassword !== form.ownerPasswordConfirm) return 'كلمتا المرور غير متطابقتين';
    }
    if (step === 2) {
      if (!form.brandNameAr) return 'اسم البراند بالعربية مطلوب';
      if (!form.brandSlug || form.brandSlug.length < 3) return 'المعرّف المختصر 3 أحرف على الأقل';
    }
    if (step === 3) {
      if (!form.companyNameAr) return 'اسم الشركة بالعربية مطلوب';
    }
    if (step === 4) {
      if (!form.agreed) return 'يجب الموافقة على الشروط والأحكام';
    }
    return '';
  }

  function next() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep((s) => s + 1);
  }

  function back() {
    setError('');
    setStep((s) => s - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerNameAr: form.ownerNameAr,
          ownerNameEn: form.ownerNameEn || undefined,
          ownerEmail: form.ownerEmail,
          ownerPhone: form.ownerPhone || undefined,
          ownerPassword: form.ownerPassword,
          brandNameAr: form.brandNameAr,
          brandNameEn: form.brandNameEn || undefined,
          brandSlug: form.brandSlug,
          companyNameAr: form.companyNameAr,
          companyNameEn: form.companyNameEn || undefined,
          taxNumber: form.taxNumber || undefined,
          plan: form.plan,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'حدث خطأ أثناء التسجيل');
        return;
      }
      router.push(`/${locale}/verify-email`);
    } catch {
      setError('تعذّر الاتصال بالخادم، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  }

  const STEP_LABELS = ['معلومات المالك', 'بيانات البراند', 'الشركة الأولى', 'خطة الاشتراك'];

  return (
    <div className="reg-root">
      <div className="reg-bg-deco" aria-hidden="true" />

      <div className="reg-card">
        {/* Logo */}
        <div className="reg-logo">
          <div className="auth-logo-mark" style={{ inlineSize: 36, blockSize: 36 }}>
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <path d="M14 4L24 10V18L14 24L4 18V10L14 4Z" fill="white" fillOpacity="0.9" />
              <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <span className="auth-logo-name">OFS</span>
        </div>

        <h1 className="reg-title">إنشاء حساب براند</h1>

        {/* Step indicator */}
        <div className="reg-steps" role="list" aria-label="خطوات التسجيل">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const cls = n < step ? 'reg-step reg-step--done' : n === step ? 'reg-step reg-step--active' : 'reg-step';
            return (
              <div key={n} className={cls} role="listitem" aria-current={n === step ? 'step' : undefined}>
                <div className="reg-step-dot">
                  {n < step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : n}
                </div>
                <span className="reg-step-label">{label}</span>
              </div>
            );
          })}
        </div>

        {error && <div className="auth-error-banner" role="alert">{error}</div>}

        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
        <form onSubmit={handleSubmit} noValidate>
          {/* ── Step 1: Owner Info ────────────────────────────────────────── */}
          {step === 1 && (
            <div className="reg-step-body">
              <div className="reg-row-2">
                <div className="form-group">
                  <label className="form-label">الاسم بالعربية <span className="reg-required">*</span></label>
                  <input className="form-input" placeholder="محمد العلي" value={form.ownerNameAr} onChange={(e) => set('ownerNameAr', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">الاسم بالإنجليزية</label>
                  <input className="form-input" placeholder="Mohammed Al-Ali" dir="ltr" value={form.ownerNameEn} onChange={(e) => set('ownerNameEn', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">البريد الإلكتروني <span className="reg-required">*</span></label>
                <input type="email" className="form-input" placeholder="name@company.com" dir="ltr" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">رقم الجوال</label>
                <input type="tel" className="form-input" placeholder="+966 5X XXX XXXX" dir="ltr" value={form.ownerPhone} onChange={(e) => set('ownerPhone', e.target.value)} />
              </div>
              <div className="reg-row-2">
                <div className="form-group">
                  <label htmlFor="reg-password" className="form-label">كلمة المرور <span className="reg-required">*</span></label>
                  <OfsPasswordInput
                    id="reg-password"
                    value={form.ownerPassword}
                    onChange={(v) => set('ownerPassword', v)}
                    placeholder="8 أحرف كحد أدنى"
                    minLength={8}
                    required
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password-confirm" className="form-label">تأكيد كلمة المرور <span className="reg-required">*</span></label>
                  <OfsPasswordInput
                    id="reg-password-confirm"
                    value={form.ownerPasswordConfirm}
                    onChange={(v) => set('ownerPasswordConfirm', v)}
                    error={!!(form.ownerPasswordConfirm && form.ownerPassword !== form.ownerPasswordConfirm)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Brand Info ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="reg-step-body">
              <div className="reg-row-2">
                <div className="form-group">
                  <label className="form-label">اسم البراند بالعربية <span className="reg-required">*</span></label>
                  <input className="form-input" placeholder="شركة الخليج للتجارة" value={form.brandNameAr} onChange={(e) => { set('brandNameAr', e.target.value); if (!form.brandSlug || form.brandSlug === toSlug(form.brandNameAr.slice(0, -1))) autoSlug(e.target.value); }} required />
                </div>
                <div className="form-group">
                  <label className="form-label">اسم البراند بالإنجليزية</label>
                  <input className="form-input" placeholder="Gulf Trading Co." dir="ltr" value={form.brandNameEn} onChange={(e) => { set('brandNameEn', e.target.value); if (!form.brandSlug) set('brandSlug', toSlug(e.target.value)); }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">المعرّف المختصر (Slug) <span className="reg-required">*</span></label>
                <div className="reg-slug-wrap">
                  <span className="reg-slug-prefix">ofs.io/</span>
                  <input className="form-input reg-slug-input" placeholder="gulf-trading" dir="ltr" value={form.brandSlug} onChange={(e) => set('brandSlug', toSlug(e.target.value))} minLength={3} maxLength={40} required />
                </div>
                <p className="form-hint">يُستخدم كمعرّف فريد للبراند — أحرف إنجليزية وأرقام وشرطات فقط</p>
              </div>
            </div>
          )}

          {/* ── Step 3: First Company ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="reg-step-body">
              <p className="reg-hint-note">سيتم إنشاء الشركة الأولى والفرع الرئيسي تلقائياً</p>
              <div className="reg-row-2">
                <div className="form-group">
                  <label className="form-label">اسم الشركة بالعربية <span className="reg-required">*</span></label>
                  <input className="form-input" placeholder="شركة الخليج للتجارة المحدودة" value={form.companyNameAr} onChange={(e) => set('companyNameAr', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">اسم الشركة بالإنجليزية</label>
                  <input className="form-input" placeholder="Gulf Trading Co. Ltd." dir="ltr" value={form.companyNameEn} onChange={(e) => set('companyNameEn', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">الرقم الضريبي</label>
                <input className="form-input" placeholder="3XXXXXXXXXX" dir="ltr" value={form.taxNumber} onChange={(e) => set('taxNumber', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Step 4: Plan ─────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="reg-step-body">
              <p className="reg-hint-note">اختر الخطة المناسبة لنشاطك التجاري</p>
              <div className="reg-plans">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`reg-plan-card${form.plan === p.id ? ' reg-plan-card--active' : ''}`}
                    onClick={() => set('plan', p.id)}
                  >
                    <div className="reg-plan-name">{p.labelAr}</div>
                    <div className="reg-plan-price">{p.priceAr}</div>
                    <ul className="reg-plan-features">
                      {p.features.map((f) => (
                        <li key={f}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {form.plan === p.id && (
                      <div className="reg-plan-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <label className="reg-agree-label">
                <input type="checkbox" className="reg-agree-checkbox" checked={form.agreed} onChange={(e) => set('agreed', e.target.checked)} />
                <span>
                  أوافق على{' '}
                  <a href="#" className="auth-forgot-link" onClick={(e) => e.preventDefault()}>الشروط والأحكام</a>
                  {' '}و{' '}
                  <a href="#" className="auth-forgot-link" onClick={(e) => e.preventDefault()}>سياسة الخصوصية</a>
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="reg-nav">
            {step > 1 && (
              <button type="button" className="reg-btn-back" onClick={back} disabled={loading}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                السابق
              </button>
            )}
            {step < 4 ? (
              <OfsButton variant="primary" className="reg-btn-next" onClick={next}>
                التالي
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </OfsButton>
            ) : (
              <OfsButton type="submit" variant="primary" className="reg-btn-next" loading={loading} disabled={!form.agreed}>
                إنشاء الحساب
              </OfsButton>
            )}
          </div>
        </form>

        <p className="auth-register-link">
          لديك حساب بالفعل؟{' '}
          <Link href={`/${locale}/login`} className="auth-forgot-link">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
