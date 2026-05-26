'use client';

export default function FinancialStatementsPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">القوائم المالية</h2>
          <p className="page-subtitle">قائمة الدخل، قائمة المركز المالي، التدفقات النقدية</p>
        </div>
      </div>
      <div className="ofs-card" style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, margin: '0 auto var(--space-3)' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>القوائم المالية قيد التطوير</p>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-xs)' }}>تتوفر عند اكتمال بيانات الترحيل في مراكز العمليات</p>
      </div>
    </>
  );
}
