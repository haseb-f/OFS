import type { PrStatus, RfqStatus, PoStatus, PiStatus, DnStatus, PrRetStatus, VpStatus, VendorStatus } from '@/lib/purchasing-mock-data';
import {
  PR_STATUS_LABELS, RFQ_STATUS_LABELS, PO_STATUS_LABELS,
  PI_STATUS_LABELS, DN_STATUS_LABELS, PR_RET_STATUS_LABELS,
  VP_STATUS_LABELS, VENDOR_STATUS_LABELS,
} from '@/lib/purchasing-mock-data';

const PR_CLASS: Record<PrStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  cancelled: 'pur-status-cancelled',
};

const RFQ_CLASS: Record<RfqStatus, string> = {
  draft:     'pur-status-draft',
  sent:      'pur-status-sent',
  received:  'pur-status-received',
  cancelled: 'pur-status-cancelled',
};

const PO_CLASS: Record<PoStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  received:  'pur-status-received',
  invoiced:  'pur-status-invoiced',
  paid:      'pur-status-paid',
  cancelled: 'pur-status-cancelled',
};

const PI_CLASS: Record<PiStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  paid:      'pur-status-paid',
  cancelled: 'pur-status-cancelled',
};

const DN_CLASS: Record<DnStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  paid:      'pur-status-paid',
  cancelled: 'pur-status-cancelled',
};

const RET_CLASS: Record<PrRetStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  received:  'pur-status-received',
  cancelled: 'pur-status-cancelled',
};

const VP_CLASS: Record<VpStatus, string> = {
  draft:     'pur-status-draft',
  approved:  'pur-status-approved',
  paid:      'pur-status-paid',
  cancelled: 'pur-status-cancelled',
};

const VENDOR_CLASS: Record<VendorStatus, string> = {
  active:      'pur-vendor-active',
  inactive:    'pur-vendor-inactive',
  blacklisted: 'pur-vendor-blacklisted',
};

export function PrBadge({ status }: { status: PrStatus }) {
  return <span className={`status-badge ${PR_CLASS[status]}`}>{PR_STATUS_LABELS[status]}</span>;
}

export function RfqBadge({ status }: { status: RfqStatus }) {
  return <span className={`status-badge ${RFQ_CLASS[status]}`}>{RFQ_STATUS_LABELS[status]}</span>;
}

export function PoBadge({ status }: { status: PoStatus }) {
  return <span className={`status-badge ${PO_CLASS[status]}`}>{PO_STATUS_LABELS[status]}</span>;
}

export function PiBadge({ status }: { status: PiStatus }) {
  return <span className={`status-badge ${PI_CLASS[status]}`}>{PI_STATUS_LABELS[status]}</span>;
}

export function DnBadge({ status }: { status: DnStatus }) {
  return <span className={`status-badge ${DN_CLASS[status]}`}>{DN_STATUS_LABELS[status]}</span>;
}

export function RetBadge({ status }: { status: PrRetStatus }) {
  return <span className={`status-badge ${RET_CLASS[status]}`}>{PR_RET_STATUS_LABELS[status]}</span>;
}

export function VpBadge({ status }: { status: VpStatus }) {
  return <span className={`status-badge ${VP_CLASS[status]}`}>{VP_STATUS_LABELS[status]}</span>;
}

export function VendorBadge({ status }: { status: VendorStatus }) {
  return <span className={`status-badge ${VENDOR_CLASS[status]}`}>{VENDOR_STATUS_LABELS[status]}</span>;
}
