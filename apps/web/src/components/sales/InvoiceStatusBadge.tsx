import type { SalesInvoiceStatus } from '@/lib/mock-data';
import { SALES_INVOICE_STATUS_LABELS } from '@/lib/mock-data';

const CLS: Record<SalesInvoiceStatus, string> = {
  draft:     'invoice-status-draft',
  approved:  'invoice-status-approved',
  posted:    'invoice-status-posted',
  cancelled: 'invoice-status-cancelled',
};

export default function InvoiceStatusBadge({ status }: { status: SalesInvoiceStatus }) {
  return <span className={`status-badge ${CLS[status]}`}>{SALES_INVOICE_STATUS_LABELS[status]}</span>;
}
