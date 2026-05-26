'use client';

interface OfsCardSkeletonProps {
  count?: number;
}

function Bone({ w, h, radius }: { w?: string; h?: string; radius?: string }) {
  return (
    <div
      className="ofs-bone"
      style={{
        width: w ?? '100%',
        height: h ?? '16px',
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}

function KpiCardSkeleton() {
  return (
    <div
      className="kpi-card"
      aria-hidden="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Bone w="55%" h="12px" />
          <Bone w="40%" h="24px" />
        </div>
        <Bone w="44px" h="44px" radius="12px" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bone w="16px" h="16px" radius="50%" />
        <Bone w="60%" h="12px" />
      </div>
    </div>
  );
}

export function OfsKpiSkeleton({ count = 5 }: OfsCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="جاري تحميل مؤشرات الأداء"
      aria-busy="true"
      className="kpi-grid"
    >
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
      <span className="sr-only">جاري تحميل مؤشرات الأداء</span>
    </div>
  );
}

function GenericCardSkeleton() {
  return (
    <div
      className="ofs-card"
      aria-hidden="true"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <Bone w="60%" h="16px" />
      <Bone h="12px" />
      <Bone w="80%" h="12px" />
      <Bone w="40%" h="12px" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Bone w="72px" h="28px" radius="20px" />
        <Bone w="72px" h="28px" radius="20px" />
      </div>
    </div>
  );
}

export function OfsCardSkeleton({ count = 3 }: OfsCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="جاري تحميل البطاقات"
      aria-busy="true"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <GenericCardSkeleton key={i} />
      ))}
      <span className="sr-only">جاري تحميل البطاقات</span>
    </div>
  );
}

export function OfsFormSkeleton() {
  return (
    <div
      role="status"
      aria-label="جاري تحميل النموذج"
      aria-busy="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} aria-hidden="true">
          <Bone w="30%" h="12px" />
          <Bone h="40px" radius="10px" />
        </div>
      ))}
      <Bone w="100%" h="44px" radius="10px" />
      <span className="sr-only">جاري تحميل النموذج</span>
    </div>
  );
}
