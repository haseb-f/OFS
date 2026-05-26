import type { CollectionStatus, CollectionMatchingStatus } from '@/lib/mock-data';
import { COLLECTION_STATUS_LABELS, COLLECTION_MATCHING_LABELS } from '@/lib/mock-data';

const STATUS_CLS: Record<CollectionStatus, string> = {
  imported:        'collection-status-imported',
  suggested_match: 'collection-status-suggested',
  matched:         'collection-status-matched',
  approved:        'collection-status-approved',
  invoice_created: 'collection-status-invoice',
  receipt_created: 'collection-status-receipt',
  posted:          'collection-status-posted',
  rejected:        'collection-status-rejected',
};

const MATCH_CLS: Record<CollectionMatchingStatus, string> = {
  matched:   'collection-match-matched',
  partial:   'collection-match-partial',
  unmatched: 'collection-match-unmatched',
};

export function CollectionStatusBadge({ status }: { status: CollectionStatus }) {
  return <span className={`status-badge ${STATUS_CLS[status]}`}>{COLLECTION_STATUS_LABELS[status]}</span>;
}

export function CollectionMatchBadge({ status }: { status: CollectionMatchingStatus }) {
  return <span className={`status-badge ${MATCH_CLS[status]}`}>{COLLECTION_MATCHING_LABELS[status]}</span>;
}
