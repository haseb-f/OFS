'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OfsPasswordInput } from '@/components/auth/OfsPasswordInput';
import { OfsButton } from '@/components/auth/OfsButton';

export default function ResetPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch || password.length < 8) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="auth-shell">
      <div className="auth-bg-deco" aria-hidden="true" />
      <div className="auth-card">
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

        {!done ? (
          <>
            <h1 className="auth-title">تعيين كلمة مرور جديدة</h1>
            <p className="auth-subtitle">يجب أن تكون كلمة المرور 8 أحرف على الأقل</p>

            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">كلمة المرور الجديدة</label>
                <OfsPasswordInput
                  id="new-password"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password" className="form-label">تأكيد كلمة المرور</label>
                <OfsPasswordInput
                  id="confirm-password"
                  value={confirm}
                  onChange={setConfirm}
                  required
                  error={mismatch}
                  autoComplete="new-password"
                />
                {mismatch && <p className="form-field-error">كلمتا المرور غير متطابقتين</p>}
              </div>

              <OfsButton type="submit" variant="primary" loading={loading} disabled={mismatch || password.length < 8}>
                حفظ كلمة المرور الجديدة
              </OfsButton>
            </form>
          </>
        ) : (
          <div className="auth-success-block">
            <div className="auth-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="auth-title">تم تغيير كلمة المرور!</h2>
            <p className="auth-subtitle">يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
            <Link href={`/${locale}/login`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', marginBlockStart: 'var(--space-4)' }}>
              تسجيل الدخول
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
