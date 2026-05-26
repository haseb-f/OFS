import type { QuotationStatus } from '@/lib/mock-data';
import { QUOTATION_STATUS_LABELS } from '@/lib/mock-data';

const CLS: Record<QuotationStatus, string> = {
  draft:    'quote-status-draft',
  sent:     'quote-status-sent',
  accepted: 'quote-status-accepted',
  rejected: 'quote-status-rejected',
  expired:  'quote-status-expired',
};

export default function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return <span className={`status-badge ${CLS[status]}`}>{QUOTATION_STATUS_LABELS[status]}</span>;
}
