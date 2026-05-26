'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OfsButton } from '@/components/auth/OfsButton';

export default function PlatformForgotPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
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

        {!sent ? (
          <>
            <h2 className="plat-auth-card-title">استعادة كلمة المرور</h2>
            <p className="plat-auth-card-sub">أدخل بريدك الإلكتروني وسنرسل رابط إعادة التعيين</p>

            <form onSubmit={handleSubmit} noValidate style={{ marginBlockStart: 'var(--space-6)' }}>
              <div className="plat-form-group">
                <label htmlFor="forgot-email" className="form-label">البريد الإلكتروني</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="ofs-input"
                  placeholder="admin@ofs.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <OfsButton
                type="submit"
                variant="primary"
                className="btn-cta plat-login-btn"
                loading={loading}
                loadingText="جاري الإرسال..."
                style={{ marginBlockStart: 'var(--space-2)' }}
              >
                إرسال رابط الاستعادة
              </OfsButton>
            </form>
          </>
        ) : (
          <div className="plat-auth-success">
            <div className="plat-auth-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.22 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.06 6.06l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3 className="plat-auth-success-title">تم الإرسال!</h3>
            <p className="plat-auth-success-text">تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.</p>
          </div>
        )}

        <div className="plat-auth-back-link">
          <Link href={`/${locale}/platform/login`} className="plat-forgot-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'scaleX(-1)' }}>
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            العودة إلى تسجيل الدخول
          </Link>
        </div>

      </div>
    </div>
  );
}
