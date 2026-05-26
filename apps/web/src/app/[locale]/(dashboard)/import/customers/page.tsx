'use client';

import { useState } from 'react';
import ImportSourceConfigCard from '@/components/import/ImportSourceConfigCard';
import ImportReviewCenter from '@/components/import/ImportReviewCenter';
import type { ReviewRecord, ColumnDef } from '@/components/import/ImportReviewCenter';
import { mockImportSourceConfigs, mockCustomerImportReviewRecords } from '@/lib/mock-data';

const SOURCE_CONFIG = mockImportSourceConfigs.find(s => s.moduleType === 'customers_import')!;

const INITIAL_RECORDS: ReviewRecord[] = mockCustomerImportReviewRecords.map(r => ({
  id: r.id,
  rowNumber: r.rowNumber,
  reviewStatus: r.reviewStatus,
  approvalStatus: r.approvalStatus,
  fields: r.fields,
  validationMessages: r.validationMessages,
}));

const COLUMNS: ColumnDef[] = [
  { key: 'name',          labelAr: 'الاسم', width: 180 },
  { key: 'phone',         labelAr: 'الهاتف', width: 120 },
  { key: 'email',         labelAr: 'البريد الإلكتروني', width: 180 },
  { key: 'country',       labelAr: 'الدولة', width: 150 },
  { key: 'city',          labelAr: 'المدينة', width: 110 },
  {
    key: 'customer_type', labelAr: 'النوع', width: 90,
    render: (v) => v ? (
      <span style={{ fontSize: 'var(--font-size-xs)', padding: '2px 7px', borderRadius: 'var(--radius-full)', background: v === 'شركات' ? '#dbeafe' : '#f3f4f6', color: v === 'شركات' ? '#1d4ed8' : '#374151' }}>
        {v}
      </span>
    ) : '—',
  },
];

export default function CustomersImportPage() {
  const [records, setRecords] = useState<ReviewRecord[]>(INITIAL_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1800); };
  const handleApprove = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'approved' } : r));
  const handleReject  = (ids: string[]) => setRecords(prev => prev.map(r => ids.includes(r.id) ? { ...r, approvalStatus: 'rejected' } : r));

  const approved = records.filter(r => r.approvalStatus === 'approved').length;
  const pending  = records.filter(r => r.approvalStatus === 'pending').length;

  return (
    <>
      <div className="page-header">
        <div>
          <h2 className="page-title">استيراد العملاء</h2>
          <p className="page-subtitle">مراجعة واعتماد بيانات العملاء المستوردة من Google Sheets</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#dcfce7', color: '#16a34a' }}>{approved} معتمد</span>
          <span style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: '#f3f4f6', color: '#6b7280' }}>{pending} معلق</span>
        </div>
      </div>

      <ImportSourceConfigCard config={SOURCE_CONFIG} onRefresh={handleRefresh} refreshing={refreshing} onConfigure={() => {}} />
      <ImportReviewCenter records={records} columns={COLUMNS} onApprove={handleApprove} onReject={handleReject} />
    </>
  );
}
