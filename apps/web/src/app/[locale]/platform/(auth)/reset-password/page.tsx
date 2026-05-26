'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OfsPasswordInput } from '@/components/auth/OfsPasswordInput';
import { OfsButton } from '@/components/auth/OfsButton';

export default function PlatformResetPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mismatch) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 900);
  }

  return (
    <div className="plat-auth-page">
      <div className="plat-auth-card">

        <div className="plat-auth-card-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>

        {!done ? (
          <>
            <h2 className="plat-auth-card-title">تعيين كلمة مرور جديدة</h2>
            <p className="plat-auth-card-sub">يجب أن تكون كلمة المرور 8 أحرف على الأقل</p>

            <form onSubmit={handleSubmit} noValidate style={{ marginBlockStart: 'var(--space-6)' }}>
              <div className="plat-form-group">
                <label htmlFor="new-password" className="form-label">كلمة المرور الجديدة</label>
                <OfsPasswordInput
                  id="new-password"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  inputClassName="ofs-input"
                />
              </div>

              <div className="plat-form-group">
                <label htmlFor="confirm-password" className="form-label">تأكيد كلمة المرور</label>
                <OfsPasswordInput
                  id="confirm-password"
                  value={confirm}
                  onChange={setConfirm}
                  required
                  error={mismatch}
                  autoComplete="new-password"
                  inputClassName="ofs-input"
                />
                {mismatch && (
                  <p className="plat-field-error">كلمتا المرور غير متطابقتين</p>
                )}
              </div>

              <OfsButton
                type="submit"
                variant="primary"
                className="plat-login-btn"
                loading={loading}
                disabled={mismatch || password.length < 8}
                style={{ marginBlockStart: 'var(--space-2)' }}
              >
                حفظ كلمة المرور الجديدة
              </OfsButton>
            </form>
          </>
        ) : (
          <div className="plat-auth-success">
            <div className="plat-auth-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="plat-auth-success-title">تم تغيير كلمة المرور!</h3>
            <p className="plat-auth-success-text">يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
            <Link href={`/${locale}/platform/login`} className="btn-cta plat-login-btn" style={{ display: 'flex', marginBlockStart: 'var(--space-4)' }}>
              تسجيل الدخول
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
