import type { LeadStatus } from '@/lib/mock-data';

const CLASS_MAP: Record<LeadStatus, string> = {
  new:         'lead-status-new',
  in_progress: 'lead-status-in-progress',
  pending:     'lead-status-pending',
  won:         'lead-status-won',
  lost:        'lead-status-lost',
  cancelled:   'lead-status-cancelled',
};

const LABEL_MAP: Record<LeadStatus, string> = {
  new:         'جديد',
  in_progress: 'قيد المعالجة',
  pending:     'معلق',
  won:         'مُحوّل',
  lost:        'خسارة',
  cancelled:   'ملغي',
};

export default function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`status-badge ${CLASS_MAP[status]}`}>
      {LABEL_MAP[status]}
    </span>
  );
}
