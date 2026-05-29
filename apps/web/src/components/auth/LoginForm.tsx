'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { OfsPasswordInput } from './OfsPasswordInput';
import { OfsButton } from './OfsButton';
import { OfsToastContainer, useOfsToast } from '@/components/ui/OfsToast';

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toasts, push: pushToast, dismiss } = useOfsToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  async function onSubmit(data: LoginFormValues) {
    console.log('SUBMIT START');
    console.log(data);

    setLoading(true);
    try {
      console.log('API REQUEST', '/api/auth/login', { email: data.email });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, rememberMe: data.rememberMe }),
      });

      let resData: { error?: string } = {};
      try { resData = (await res.json()) as { error?: string }; } catch { /* non-JSON */ }

      console.log('API RESPONSE', { status: res.status, data: resData });

      if (!res.ok) {
        const msg = resData.error ?? 'حدث خطأ أثناء تسجيل الدخول';
        console.error('Login failed:', msg);
        pushToast(msg, 'error');
        return;
      }

      console.log('Login success — redirecting to', `/${locale}/dashboard`);
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (err) {
      console.error('Network error:', err);
      pushToast('تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <OfsToastContainer toasts={toasts} onDismiss={dismiss} />
      <div className="auth-bg-deco" aria-hidden="true" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 4L24 10V18L14 24L4 18V10L14 4Z" fill="white" fillOpacity="0.9" />
              <path d="M14 8L20 11.5V18.5L14 22L8 18.5V11.5L14 8Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>
          <div>
            <div className="auth-logo-name">OFS</div>
            <div className="auth-logo-sub">نظام إدارة الطلبات</div>
          </div>
        </div>

        <h1 className="auth-title">مرحباً بك</h1>
        <p className="auth-subtitle">سجّل دخولك للمتابعة إلى لوحة التحكم</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              البريد الإلكتروني
            </label>
            <input
              id="login-email"
              type="email"
              className={`form-input${errors.email ? ' form-input--error' : ''}`}
              placeholder="name@company.com"
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

          <div className="form-group">
            <div className="auth-label-row">
              <label htmlFor="login-password" className="form-label">كلمة المرور</label>
              <Link href={`/${locale}/forgot-password`} className="auth-forgot-link">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'كلمة المرور مطلوبة' }}
              render={({ field, fieldState }) => (
                <OfsPasswordInput
                  id="login-password"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!fieldState.error}
                  required
                />
              )}
            />
            {errors.password && (
              <span className="form-error" role="alert">{errors.password.message}</span>
            )}
          </div>

          <div className="auth-remember-row">
            <label className="auth-remember-label">
              <input
                type="checkbox"
                className="auth-remember-checkbox"
                {...register('rememberMe')}
              />
              <span>تذكّرني لمدة 30 يوماً</span>
            </label>
          </div>

          <OfsButton
            type="submit"
            variant="primary"
            loading={loading}
            loadingText="جاري التحقق..."
          >
            تسجيل الدخول
          </OfsButton>
        </form>

        <div className="auth-switch-divider"><span>أو</span></div>
        <Link href={`/${locale}/platform/login`} className="auth-switch-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>الدخول كمالك المنصة</span>
        </Link>

        <p className="auth-register-link">
          ليس لديك حساب؟{' '}
          <Link href={`/${locale}/register`} className="auth-forgot-link">
            سجّل براندك الآن
          </Link>
        </p>

        <div className="auth-footer-note">OFS v4.0 · نظام إدارة الطلبات متعدد المستأجرين</div>
      </div>
    </div>
  );
}
