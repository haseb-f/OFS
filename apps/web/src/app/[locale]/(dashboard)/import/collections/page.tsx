'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import ImportSmartMatchCard from '@/components/import/ImportSmartMatchCard';
import { mockImportSourceConfigs, mockCollectionReviewRecords } from '@/lib/mock-data';
import { fNum } from '@/lib/format';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'collection_deposit')!;

const INITIAL_RECORDS: ReviewRecord[] = mockCollectionReviewRecords.map(r => {
  const rec: ReviewRecord = {
    id: r.id,
    rowNumber: r.rowNumber,
    reviewStatus: r.reviewStatus,
    approvalStatus: r.approvalStatus,
    fields: r.fields,
    validationMessages: r.validationMessages,
  };
  if (r.smartMatch) rec.smartMatch = r.smartMatch;
  if (r.notes)      rec.notes      = r.notes;
  return rec;
});

const COLUMNS: ColumnDef[] = [
  { key: 'transaction_date', labelAr: 'التاريخ', width: 120 },
  { key: 'customer_name',    labelAr: 'العميل', width: 160 },
  { key: 'phone',            labelAr: 'الهاتف', width: 120 },
  {
    key: 'amount', labelAr: 'المبلغ', width: 110,
    render: (v) => v ? (
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 'var(--font-weight-medium)' }}>
        {fNum(parseFloat(v))}
      </span>
    ) : '—',
  },
  { key: 'currency',        labelAr: 'العملة', width: 70 },
  { key: 'payment_method',  labelAr: 'طريقة الدفع', width: 120 },
  { key: 'reference',       labelAr: 'المرجع', width: 110 },
];

export default function CollectionsImportPage() {
  useParams<{ locale: string }>();
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1800);
  };

  const handleApprove = (ids: string[]) => {
    setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  };

  const handleReject = (ids: string[]) => {
    setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));
  };

  const stats = {
    ready:    records.filter(r => r.reviewStatus === 'ready').length,
    approved: records.filter(r => r.approvalStatus === 'approved').length,
    pending:  records.filter(r => r.approvalStatus === 'pending').length,
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">استيراد التحصيلات والإيداعات</h2>
          <p className="page-subtitle">مراجعة واعتماد التحصيلات المستوردة من Google Sheets</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#16a34a' }}>
            {stats.approved} معتمد
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#f3f4f6', color: '#6b7280' }}>
            {stats.pending} معلق
          </span>
        </div>
      </div>

      <ImportSourceConfigCard
        config={SOURCE_CONFIG}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onConfigure={() => {}}
      />

      <ImportReviewCenter
        records={records}
        columns={COLUMNS}
        onApprove={handleApprove}
        onReject={handleReject}
        renderExtra={(record) =>
          record.smartMatch ? (
            <ImportSmartMatchCard
              match={record.smartMatch}
              onAccept={() => handleApprove([record.id])}
              onOverride={() => {}}
            />
          ) : null
        }
      />
    </>
  );
}
