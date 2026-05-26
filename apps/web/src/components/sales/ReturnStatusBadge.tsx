import type { ReturnStatus, ReturnType } from '@/lib/mock-data';
import { RETURN_STATUS_LABELS, RETURN_TYPE_LABELS } from '@/lib/mock-data';

const STATUS_CLS: Record<ReturnStatus, string> = {
  draft:     'return-status-draft',
  approved:  'return-status-approved',
  posted:    'return-status-posted',
  cancelled: 'return-status-cancelled',
};

const TYPE_CLS: Record<ReturnType, string> = {
  with_inventory:    'return-type-with',
  without_inventory: 'return-type-without',
};

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  return <span className={`status-badge ${STATUS_CLS[status]}`}>{RETURN_STATUS_LABELS[status]}</span>;
}

export function ReturnTypeBadge({ type }: { type: ReturnType }) {
  return <span className={`status-badge ${TYPE_CLS[type]}`}>{RETURN_TYPE_LABELS[type]}</span>;
}
