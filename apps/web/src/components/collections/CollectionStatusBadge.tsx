import type { CollectionStatus } from '@/lib/mock-data';
import { COLLECTION_STATUS_LABELS } from '@/lib/mock-data';

const CLASS_MAP: Record<CollectionStatus, string> = {
  imported:        'col-status-imported',
  suggested_match: 'col-status-suggested-match',
  matched:         'col-status-matched',
  approved:        'col-status-approved',
  invoice_created: 'col-status-invoice-created',
  receipt_created: 'col-status-receipt-created',
  posted:          'col-status-posted',
  rejected:        'col-status-rejected',
};

export default function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  return (
    <span className={`status-badge ${CLASS_MAP[status]}`}>
      {COLLECTION_STATUS_LABELS[status]}
    </span>
  );
}
