import type { CustomerStatus } from '@/lib/mock-data';

const MAP: Record<CustomerStatus, { label: string; cls: string }> = {
  active:   { label: 'نشط',      cls: 'customer-status-active'   },
  inactive: { label: 'غير نشط',  cls: 'customer-status-inactive' },
  blocked:  { label: 'محظور',    cls: 'customer-status-blocked'  },
};

export default function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const { label, cls } = MAP[status];
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
