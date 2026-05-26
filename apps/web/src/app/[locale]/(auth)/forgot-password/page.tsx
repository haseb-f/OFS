'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { OfsButton } from '@/components/auth/OfsButton';

export default function ForgotPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate sending reset email (email infrastructure not yet configured)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
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

        {!sent ? (
          <>
            <h1 className="auth-title">استعادة كلمة المرور</h1>
            <p className="auth-subtitle">أدخل بريدك الإلكتروني وسنرسل رابط إعادة التعيين</p>

            {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="forgot-email" className="form-label">البريد الإلكتروني</label>
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  dir="ltr"
                />
              </div>
              <OfsButton type="submit" variant="primary" loading={loading} disabled={!email}>
                إرسال رابط الاستعادة
              </OfsButton>
            </form>
          </>
        ) : (
          <div className="auth-success-block">
            <div className="auth-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.22 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.06 6.06l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h2 className="auth-title">تم الإرسال!</h2>
            <p className="auth-subtitle">تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.</p>
          </div>
        )}

        <div className="auth-back-link">
          <Link href={`/${locale}/login`} className="auth-forgot-link">
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
