'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { OfsPasswordInput } from '@/components/auth/OfsPasswordInput';
import { OfsButton } from '@/components/auth/OfsButton';
import { OfsToastContainer, useOfsToast } from '@/components/ui/OfsToast';

interface PlatformLoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function PlatformLoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toasts, push: pushToast, dismiss } = useOfsToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PlatformLoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  async function onSubmit(data: PlatformLoginFormValues) {
    console.log('SUBMIT START');
    console.log(data);

    setLoading(true);
    try {
      console.log('API REQUEST', '/api/auth/platform-login', { email: data.email });

      const res = await fetch('/api/auth/platform-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, rememberMe: data.rememberMe }),
      });

      let resData: { error?: string } = {};
      try { resData = (await res.json()) as { error?: string }; } catch { /* non-JSON */ }

      console.log('API RESPONSE', { status: res.status, data: resData });

      if (!res.ok) {
        const msg = resData.error ?? 'حدث خطأ أثناء تسجيل الدخول';
        console.error('Platform login failed:', msg);
        pushToast(msg, 'error');
        return;
      }

      console.log('Platform login success — redirecting to', `/${locale}/platform/dashboard`);
      router.push(`/${locale}/platform/dashboard`);
      router.refresh();
    } catch (err) {
      console.error('Network error:', err);
      pushToast('تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="plat-login-root">
      <OfsToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* ── Branding Panel ── */}
      <div className="plat-login-brand" aria-hidden="true">
        <div className="plat-login-brand-inner">
          <div className="plat-login-logo-wrap">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="plat-login-brand-title">OFS Platform</h1>
          <p className="plat-login-brand-subtitle">المنصة المركزية لإدارة المستأجرين</p>
          <div className="plat-login-features">
            {['إدارة البراندات والشركات', 'إدارة المستخدمين والصلاحيات', 'رؤية شاملة على كامل المنصة'].map((feat) => (
              <div key={feat} className="plat-login-feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>{feat}</span>
              </div>
            ))}
          </div>
          <div className="plat-login-brand-version">v4.0 · Multi-Tenant SaaS</div>
        </div>
        <div className="plat-login-deco plat-login-deco--1" aria-hidden="true"/>
        <div className="plat-login-deco plat-login-deco--2" aria-hidden="true"/>
      </div>

      {/* ── Form Panel ── */}
      <div className="plat-login-form-panel">
        <div className="plat-login-card">

          <div className="plat-login-card-header">
            <div className="plat-login-card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 className="plat-login-card-title">تسجيل الدخول</h2>
            <p className="plat-login-card-sub">لوحة تحكم مالك المنصة</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="plat-form-group">
              <label htmlFor="plat-email" className="form-label">البريد الإلكتروني</label>
              <input
                id="plat-email"
                type="email"
                className={`ofs-input${errors.email ? ' ofs-input--error' : ''}`}
                placeholder="admin@ofs.io"
                autoComplete="email"
                dir="ltr"
                {...register('email', {
                  required: 'البريد الإلكتروني مطلوب',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'بريد إلكتروني غير صالح' },
                })}
              />
              {errors.email && (
                <span className="form-error" role="alert">{errors.email.message}</span>
              )}
            </div>

            <div className="plat-form-group">
              <label htmlFor="plat-password" className="form-label">كلمة المرور</label>
              <Controller
                name="password"
                control={control}
                rules={{ required: 'كلمة المرور مطلوبة' }}
                render={({ field, fieldState }) => (
                  <OfsPasswordInput
                    id="plat-password"
                    value={field.value}
                    onChange={field.onChange}
                    error={!!fieldState.error}
                    required
                    inputClassName="ofs-input"
                  />
                )}
              />
              {errors.password && (
                <span className="form-error" role="alert">{errors.password.message}</span>
              )}
            </div>

            <div className="plat-login-meta">
              <label className="plat-remember-label">
                <input
                  type="checkbox"
                  className="plat-remember-checkbox"
                  {...register('rememberMe')}
                />
                <span>تذكّرني</span>
              </label>
              <Link href={`/${locale}/platform/forgot-password`} className="plat-forgot-link">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <OfsButton
              type="submit"
              variant="primary"
              className="plat-login-btn"
              loading={loading}
              loadingText="جاري التحقق..."
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              تسجيل الدخول
            </OfsButton>
          </form>

          <p className="plat-login-footer-note">
            هذه اللوحة مخصصة لمالكي المنصة فقط.
            <br/>
            للدخول كمستخدم براند{' '}
            <Link href={`/${locale}/login`} className="plat-forgot-link">اضغط هنا</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
