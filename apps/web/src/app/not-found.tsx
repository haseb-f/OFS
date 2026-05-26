import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minBlockSize: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        fontFamily: 'var(--font-family-base)',
        background: 'var(--color-surface-raised)',
        padding: '24px',
      }}
    >
      <div
        style={{
          fontSize: '5rem',
          fontWeight: 'bold',
          color: 'var(--color-primary)',
          lineHeight: 1,
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)' }}>
        الصفحة غير موجودة
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/ar/dashboard"
        style={{
          paddingInline: '24px',
          paddingBlock: '10px',
          background: 'var(--color-primary)',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
