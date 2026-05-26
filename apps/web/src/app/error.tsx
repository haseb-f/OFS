'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minBlockSize: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        fontFamily: 'var(--font-family-base)',
        padding: '24px',
      }}
    >
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
        حدث خطأ غير متوقع
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        {error.message ?? 'يرجى المحاولة مجدداً'}
      </p>
      <button
        onClick={reset}
        style={{
          paddingInline: '24px',
          paddingBlock: '10px',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontFamily: 'var(--font-family-base)',
        }}
      >
        إعادة المحاولة
      </button>
    </div>
  );
}
