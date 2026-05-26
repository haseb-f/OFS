import type { ImportStatus } from '@/lib/mock-data';
import { IMPORT_STATUS_LABELS } from '@/lib/mock-data';

const CLASS_MAP: Record<ImportStatus, string> = {
  completed:  'import-status-completed',
  partial:    'import-status-partial',
  failed:     'import-status-failed',
  processing: 'import-status-processing',
  draft:      'import-status-draft',
};

export default function ImportStatusBadge({ status }: { status: ImportStatus }) {
  return (
    <span className={`status-badge ${CLASS_MAP[status]}`}>
      {IMPORT_STATUS_LABELS[status]}
    </span>
  );
}
