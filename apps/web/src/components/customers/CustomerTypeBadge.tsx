import type { CustomerType } from '@/lib/mock-data';

const MAP: Record<CustomerType, { label: string; cls: string }> = {
  company:    { label: 'شركة',          cls: 'customer-type-company'    },
  individual: { label: 'فرد',           cls: 'customer-type-individual' },
  government: { label: 'جهة حكومية',    cls: 'customer-type-government' },
};

export default function CustomerTypeBadge({ type }: { type: CustomerType }) {
  const { label, cls } = MAP[type];
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
