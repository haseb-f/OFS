'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const { locale } = useParams<{ locale: string }>();

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

        <div className="auth-success-block">
          <div className="auth-success-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h1 className="auth-title">تحقق من بريدك الإلكتروني</h1>
          <p className="auth-subtitle">
            أرسلنا رابط تأكيد إلى بريدك الإلكتروني.
            <br/>
            انقر على الرابط لتفعيل حسابك.
          </p>
          <p className="auth-note">
            لم تستلم الرسالة؟{' '}
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => alert('تم إعادة الإرسال — تحقق من البريد الإلكتروني')}
            >
              إعادة الإرسال
            </button>
          </p>
        </div>

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
