'use client';

interface OfsTableLoaderProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

function Bone({ w, h }: { w?: string; h?: string }) {
  return (
    <div
      className="ofs-bone"
      style={{ width: w ?? '100%', height: h ?? '16px' }}
      aria-hidden="true"
    />
  );
}

export function OfsTableLoader({
  rows = 5,
  columns = 5,
  showHeader = true,
}: OfsTableLoaderProps) {
  const COL_WIDTHS = ['40%', '60%', '30%', '50%', '25%'];

  return (
    <div role="status" aria-label="جاري تحميل البيانات" aria-busy="true">
      <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-hidden="true">
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th
                  key={i}
                  style={{ padding: '10px 12px', textAlign: 'start' }}
                >
                  <Bone w={COL_WIDTHS[i % COL_WIDTHS.length]} h="12px" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} style={{ borderTop: '1px solid var(--color-border)' }}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} style={{ padding: '12px' }}>
                  <Bone
                    w={COL_WIDTHS[(r + c) % COL_WIDTHS.length]}
                    h="14px"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">جاري تحميل البيانات</span>
    </div>
  );
}

export function OfsListLoader({ rows = 5 }: { rows?: number }) {
  const WIDTHS = ['85%', '70%', '90%', '65%', '80%'];

  return (
    <div
      role="status"
      aria-label="جاري تحميل القائمة"
      aria-busy="true"
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          aria-hidden="true"
        >
          <div
            className="ofs-bone"
            style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0 }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Bone w={WIDTHS[i % WIDTHS.length]} h="14px" />
            <Bone w="45%" h="11px" />
          </div>
        </div>
      ))}
      <span className="sr-only">جاري تحميل القائمة</span>
    </div>
  );
}
