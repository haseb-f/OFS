import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'سياق المؤسسة' };

// ── Mock tenant context ───────────────────────────────────────────────────────

const CURRENT_CONTEXT = {
  brand:   { id: 'BRD-001', nameAr: 'مجموعة سوفت لاند',     nameEn: 'Softland Group',    status: 'active' },
  company: { id: 'CMP-001', nameAr: 'سوفت لاند للتجارة',    nameEn: 'Softland Trading',   status: 'active', brandId: 'BRD-001' },
  branch:  { id: 'BRN-001', nameAr: 'الفرع الرئيسي — الرياض', nameEn: 'HQ Branch – Riyadh', status: 'active', city: 'الرياض' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const color = status === 'active' ? '#16a34a' : '#94a3b8';
  const labelAr = status === 'active' ? 'نشط' : 'غير نشط';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', color }}>
      <span style={{ inlineSize: 7, blockSize: 7, borderRadius: '50%', background: color, display: 'inline-block' }} aria-hidden="true" />
      {labelAr}
    </span>
  );
}

function ContextCard({
  tier,
  icon,
  id,
  nameAr,
  nameEn,
  status,
  meta,
  accent,
}: {
  tier: string;
  icon: React.ReactNode;
  id: string;
  nameAr: string;
  nameEn: string;
  status: string;
  meta?: string;
  accent: string;
}) {
  return (
    <div
      className="ofs-card"
      style={{
        display: 'flex',
        gap: 'var(--space-4)',
        padding: 'var(--space-5)',
        alignItems: 'flex-start',
        borderInlineStart: `3px solid ${accent}`,
        marginBlockEnd: 'var(--space-4)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          inlineSize: '48px',
          blockSize: '48px',
          borderRadius: 'var(--radius-lg)',
          background: `${accent}18`,
          color: accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minInlineSize: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBlockEnd: 'var(--space-1)' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {tier}
          </span>
          <StatusDot status={status} />
        </div>
        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)' }}>
          {nameAr}
        </div>
        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockStart: '2px' }} dir="ltr">
          {nameEn}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBlockStart: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
            الكود: <span style={{ color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)', fontFamily: 'monospace' }}>{id}</span>
          </span>
          {meta && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
              {meta}
            </span>
          )}
        </div>
      </div>

      {/* Lock icon — context is read-only */}
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-text-subtle)', flexShrink: 0, marginBlockStart: 'var(--space-1)' }} aria-label="للقراءة فقط">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
      </svg>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IcoBrand() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
    </svg>
  );
}

function IcoCompany() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
    </svg>
  );
}

function IcoBranch() {
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TenantContextPage() {
  return (
    <div>
      {/* Current Context */}
      <div style={{ marginBlockEnd: 'var(--space-6)' }}>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlockEnd: 'var(--space-4)' }}>
          الجلسة الحالية مقيّدة بالسياق التالي. يحدّد هذا السياق البيانات المعروضة وصلاحيات الوصول في كامل المنظومة.
        </p>

        <ContextCard
          tier="البراند"
          icon={<IcoBrand />}
          id={CURRENT_CONTEXT.brand.id}
          nameAr={CURRENT_CONTEXT.brand.nameAr}
          nameEn={CURRENT_CONTEXT.brand.nameEn}
          status={CURRENT_CONTEXT.brand.status}
          accent="#16a34a"
        />

        <ContextCard
          tier="الشركة"
          icon={<IcoCompany />}
          id={CURRENT_CONTEXT.company.id}
          nameAr={CURRENT_CONTEXT.company.nameAr}
          nameEn={CURRENT_CONTEXT.company.nameEn}
          status={CURRENT_CONTEXT.company.status}
          meta={`تابعة لـ: ${CURRENT_CONTEXT.brand.nameAr}`}
          accent="#3b82f6"
        />

        <ContextCard
          tier="الفرع"
          icon={<IcoBranch />}
          id={CURRENT_CONTEXT.branch.id}
          nameAr={CURRENT_CONTEXT.branch.nameAr}
          nameEn={CURRENT_CONTEXT.branch.nameEn}
          status={CURRENT_CONTEXT.branch.status}
          meta={`المدينة: ${CURRENT_CONTEXT.branch.city}`}
          accent="#8b5cf6"
        />
      </div>

      {/* Future: Context Switch — teaser */}
      <div
        className="ofs-card"
        style={{
          padding: 'var(--space-6)',
          background: 'linear-gradient(135deg, rgba(22,163,74,0.04) 0%, rgba(59,130,246,0.04) 100%)',
          border: '1px dashed var(--color-border)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            inlineSize: '48px',
            blockSize: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginInline: 'auto',
            marginBlockEnd: 'var(--space-4)',
          }}
          aria-hidden="true"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--color-text-subtle)' }}>
            <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
          </svg>
        </div>

        <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text)', marginBlock: 0, marginBlockEnd: 'var(--space-2)' }}>
          تبديل السياق
        </h4>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBlock: 0, marginBlockEnd: 'var(--space-4)' }}>
          قريباً — إمكانية التنقل بين البراندات والشركات والفروع المختلفة دون الحاجة لتسجيل خروج وإعادة دخول.
        </p>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-semibold)',
            color: '#7c3aed',
            background: '#f5f3ff',
            border: '1px solid #e9d5ff',
            borderRadius: 'var(--radius-full)',
            paddingInline: 'var(--space-3)',
            paddingBlock: 'var(--space-1)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
          قادم قريباً
        </span>
      </div>
    </div>
  );
}
