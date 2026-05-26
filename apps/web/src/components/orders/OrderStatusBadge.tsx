import type { OrderStatus } from '@/lib/mock-data';
import { ORDER_STATUS_LABELS } from '@/lib/mock-data';

const CLASS_MAP: Record<OrderStatus, string> = {
  draft:      'order-status-draft',
  confirmed:  'order-status-confirmed',
  processing: 'order-status-processing',
  shipped:    'order-status-shipped',
  delivered:  'order-status-delivered',
  completed:  'order-status-completed',
  cancelled:  'order-status-cancelled',
  returned:   'order-status-returned',
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge ${CLASS_MAP[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
