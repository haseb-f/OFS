import type { ActivityItem } from '@/lib/mock-data';

interface ActivityTableProps {
  items: ActivityItem[];
}

const STATUS_STYLES: Record<ActivityItem['status'], { bg: string; color: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
  completed: { bg: 'rgba(22,163,74,0.12)',   color: '#15803d' },
  cancelled: { bg: 'rgba(107,114,128,0.12)', color: '#4b5563' },
  active:    { bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
};

function StatusBadge({ status, labelAr }: { status: ActivityItem['status']; labelAr: string }) {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: styles.bg, color: styles.color }}
      role="status"
    >
      {labelAr}
    </span>
  );
}

export default function ActivityTable({ items }: ActivityTableProps) {
  return (
    <div className="ofs-card">
      <div className="ofs-card-header">
        <h2 className="ofs-card-title">آخر النشاطات</h2>
        <button className="btn-outline" style={{ fontSize: 'var(--font-size-xs)', paddingBlock: 'var(--space-1)', paddingInline: 'var(--space-3)' }}>
          عرض الكل
        </button>
      </div>

      <div className="ofs-table-wrap">
        <table className="ofs-table" aria-label="جدول آخر النشاطات">
          <thead>
            <tr>
              <th scope="col">النوع</th>
              <th scope="col">الوصف</th>
              <th scope="col">العميل</th>
              <th scope="col">المبلغ</th>
              <th scope="col">التاريخ</th>
              <th scope="col">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 'var(--font-weight-semibold)',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.typeAr}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
                    {item.descriptionAr}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div
                      style={{
                        inlineSize: '28px',
                        blockSize: '28px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-primary-subtle)',
                        color: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-bold)',
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      {item.customerAr.charAt(0)}
                    </div>
                    <span style={{ whiteSpace: 'nowrap', maxInlineSize: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.customerAr}
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ fontWeight: 'var(--font-weight-semibold)', fontVariantNumeric: 'tabular-nums' }}>
                    {item.amount}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>
                    {item.date}
                  </span>
                </td>
                <td>
                  <StatusBadge status={item.status} labelAr={item.statusAr} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
